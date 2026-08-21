import type Stripe from "stripe";
import { stripe, APP_URL } from "@/lib/stripe";
import { ACCESS_PLANS, type AccessPlanKey } from "@/lib/pricing";
import { priceIdForPlan } from "@/lib/stripe-helpers";

// Diagnóstico de la configuración de Stripe EN EL SERVIDOR.
//
// Por qué existe: las variables de entorno de Vercel son `Sensitive`, así que no se
// pueden leer de vuelta con `vercel env pull` ni comprobar desde el portátil. La única
// forma de saber si la web cobra de verdad es preguntarlo desde dentro, donde la clave
// ya vive. Esta función NO devuelve jamás el valor de un secreto: solo si está definido,
// de qué modo es y qué contesta Stripe al usarlo.
//
// Es de SOLO LECTURA: no crea precios, ni endpoints, ni sesiones de pago.

export type Severidad = "critico" | "aviso" | "ok";

export type Hallazgo = { nivel: Severidad; texto: string };

export type PrecioDiag = {
  plan: AccessPlanKey;
  variable: string;
  definida: boolean;
  encontrado: boolean;
  error?: string;
  modo?: "live" | "prueba";
  activo?: boolean;
  importeCents?: number;
  moneda?: string;
  intervalo?: string;
  impuesto?: string;
  producto?: string;
  importeWebCents: number;
};

export type WebhookDiag = {
  url: string;
  estado: string;
  apiVersion: string | null;
  esDeEstaWeb: boolean;
  eventos: string[];
  faltan: string[];
};

export type StripeDiagnostico = {
  generadoEn: string;
  entorno: { appUrl: string; hostEsperado: string; nodeEnv: string };
  clave: { definida: boolean; modo: "live" | "prueba" | "restringida" | "desconocido" };
  cuenta?: { id: string; nombre: string | null; pais: string | null; cobrosActivos: boolean };
  precios: PrecioDiag[];
  secretoWebhook: { definido: boolean; formatoOk: boolean };
  webhooks: WebhookDiag[];
  webhooksLegibles: boolean;
  hallazgos: Hallazgo[];
};

// Eventos que el webhook (`/api/stripe/webhook`) sabe procesar. Si el endpoint de Stripe
// no los manda, el pago se cobra pero la familia NO obtiene acceso.
const EVENTOS_NECESARIOS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
];

function modoDeClave(key: string | undefined): StripeDiagnostico["clave"]["modo"] {
  if (!key) return "desconocido";
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "prueba";
  if (key.startsWith("rk_")) return "restringida";
  return "desconocido";
}

function nombreProducto(product: Stripe.Price["product"]): string | undefined {
  if (typeof product === "string") return product;
  if (product && "name" in product) return product.name;
  return undefined;
}

export async function diagnosticarStripe(): Promise<StripeDiagnostico> {
  const hallazgos: Hallazgo[] = [];
  const claveBruta = process.env.STRIPE_SECRET_KEY?.trim();
  const modo = modoDeClave(claveBruta);
  const hostEsperado = "https://www.gescuida.es";

  const diag: StripeDiagnostico = {
    generadoEn: new Date().toISOString(),
    entorno: {
      appUrl: APP_URL,
      hostEsperado,
      nodeEnv: process.env.NODE_ENV ?? "desconocido",
    },
    clave: { definida: Boolean(claveBruta), modo },
    precios: [],
    secretoWebhook: {
      definido: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
      formatoOk: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim().startsWith("whsec_")),
    },
    webhooks: [],
    webhooksLegibles: false,
    hallazgos,
  };

  if (!claveBruta || !stripe) {
    hallazgos.push({ nivel: "critico", texto: "No hay STRIPE_SECRET_KEY: la web no puede cobrar nada." });
    return diag;
  }

  if (modo === "prueba") {
    hallazgos.push({
      nivel: "critico",
      texto:
        "La clave es de PRUEBA (sk_test_). Los pagos no son reales: nadie ha cobrado nunca por esta web.",
    });
  } else if (modo === "live") {
    hallazgos.push({ nivel: "ok", texto: "La clave secreta es de modo LIVE: los cobros son reales." });
  } else {
    hallazgos.push({
      nivel: "aviso",
      texto: `Clave de tipo «${modo}»: no se puede deducir el modo por el prefijo; míralo en los precios de abajo.`,
    });
  }

  if (!diag.secretoWebhook.definido) {
    hallazgos.push({
      nivel: "critico",
      texto:
        "Falta STRIPE_WEBHOOK_SECRET: el webhook rechaza TODO con 500 y ninguna suscripción llega a activarse.",
    });
  } else if (!diag.secretoWebhook.formatoOk) {
    hallazgos.push({
      nivel: "critico",
      texto: "STRIPE_WEBHOOK_SECRET no empieza por «whsec_»: la firma nunca validará.",
    });
  }

  if (!APP_URL.startsWith(hostEsperado)) {
    hallazgos.push({
      nivel: "aviso",
      texto: `NEXT_PUBLIC_APP_URL es «${APP_URL}»; se esperaba ${hostEsperado} (es el host que Google tiene indexado y el que usan success_url y los enlaces de los correos).`,
    });
  }

  // ── Cuenta ──────────────────────────────────────────────────────────────────
  try {
    const cuenta = await stripe.accounts.retrieve();
    diag.cuenta = {
      id: cuenta.id,
      nombre: cuenta.settings?.dashboard?.display_name ?? cuenta.business_profile?.name ?? null,
      pais: cuenta.country ?? null,
      cobrosActivos: Boolean(cuenta.charges_enabled),
    };
    if (!cuenta.charges_enabled) {
      hallazgos.push({
        nivel: "critico",
        texto: "La cuenta de Stripe NO tiene los cobros activados (charges_enabled = false).",
      });
    }
  } catch (e) {
    hallazgos.push({
      nivel: "aviso",
      texto: `No se ha podido leer la cuenta de Stripe (${(e as Error).message}). Puede ser una clave restringida sin ese permiso.`,
    });
  }

  // ── Precios de los dos planes de acceso ─────────────────────────────────────
  // Un price id es específico del modo: si en Vercel quedó el de PRUEBA con una clave
  // LIVE, Stripe contesta «No such price» y el checkout revienta al pulsar el botón.
  for (const plan of ["BASICO", "COMPLETO"] as AccessPlanKey[]) {
    const variable = `STRIPE_PRICE_${plan}`;
    const priceId = priceIdForPlan(plan);
    const importeWebCents = ACCESS_PLANS[plan].priceCents;
    const fila: PrecioDiag = {
      plan,
      variable,
      definida: Boolean(priceId),
      encontrado: false,
      importeWebCents,
    };

    if (!priceId) {
      hallazgos.push({
        nivel: "critico",
        texto: `Falta ${variable}: el checkout del ${ACCESS_PLANS[plan].name} devuelve error 500 antes de llegar a Stripe.`,
      });
      diag.precios.push(fila);
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
      fila.encontrado = true;
      fila.modo = price.livemode ? "live" : "prueba";
      fila.activo = price.active;
      fila.importeCents = price.unit_amount ?? undefined;
      fila.moneda = price.currency;
      fila.intervalo = price.recurring?.interval ?? undefined;
      fila.impuesto = price.tax_behavior ?? undefined;
      fila.producto = nombreProducto(price.product);

      if (!price.active) {
        hallazgos.push({
          nivel: "critico",
          texto: `El precio del ${ACCESS_PLANS[plan].name} está ARCHIVADO en Stripe: no se puede comprar.`,
        });
      }
      if (price.recurring?.interval !== "month") {
        hallazgos.push({
          nivel: "critico",
          texto: `El precio del ${ACCESS_PLANS[plan].name} no es una suscripción mensual (intervalo: ${price.recurring?.interval ?? "pago único"}); el checkout se crea en modo subscription y fallaría.`,
        });
      }
      if (price.currency !== "eur") {
        hallazgos.push({
          nivel: "critico",
          texto: `El precio del ${ACCESS_PLANS[plan].name} está en ${price.currency.toUpperCase()}, no en euros.`,
        });
      }
      if (price.unit_amount != null && price.unit_amount !== importeWebCents) {
        hallazgos.push({
          nivel: "critico",
          texto: `El ${ACCESS_PLANS[plan].name} se anuncia a ${(importeWebCents / 100).toFixed(2)} € en la web pero Stripe cobra ${(price.unit_amount / 100).toFixed(2)} €.`,
        });
      }
      if (price.tax_behavior !== "inclusive") {
        hallazgos.push({
          nivel: "aviso",
          texto: `El precio del ${ACCESS_PLANS[plan].name} tiene tax_behavior «${price.tax_behavior ?? "sin definir"}». Si la web enseña el precio con IVA incluido, Stripe puede sumar el impuesto por encima y el cliente pagaría más de lo que vio.`,
        });
      }
    } catch (e) {
      fila.error = (e as Error).message;
      hallazgos.push({
        nivel: "critico",
        texto: `Stripe no reconoce el precio de ${variable} (${fila.error}). Suele ser un price id del OTRO modo: el checkout de ese plan falla al pulsar el botón.`,
      });
    }

    diag.precios.push(fila);
  }

  // ── Endpoints de webhook ────────────────────────────────────────────────────
  // Sin un endpoint apuntando a esta web, la familia paga y NO obtiene acceso.
  try {
    const lista = await stripe.webhookEndpoints.list({ limit: 100 });
    diag.webhooksLegibles = true;
    diag.webhooks = lista.data.map((w) => {
      const eventos = w.enabled_events ?? [];
      const todos = eventos.includes("*");
      return {
        url: w.url,
        estado: w.status ?? "desconocido",
        apiVersion: w.api_version ?? null,
        esDeEstaWeb: w.url.includes("gescuida.es") && w.url.includes("/api/stripe/webhook"),
        eventos,
        faltan: todos ? [] : EVENTOS_NECESARIOS.filter((e) => !eventos.includes(e)),
      };
    });

    const propios = diag.webhooks.filter((w) => w.esDeEstaWeb);
    if (propios.length === 0) {
      hallazgos.push({
        nivel: "critico",
        texto:
          "No hay ningún endpoint de webhook apuntando a gescuida.es/api/stripe/webhook en esta cuenta y modo: las familias pagarían sin que se les active el acceso.",
      });
    } else {
      for (const w of propios) {
        if (w.estado !== "enabled") {
          hallazgos.push({ nivel: "critico", texto: `El endpoint ${w.url} está «${w.estado}», no activo.` });
        }
        if (w.faltan.length > 0) {
          hallazgos.push({
            nivel: "critico",
            texto: `Al endpoint ${w.url} le faltan eventos que la web procesa: ${w.faltan.join(", ")}.`,
          });
        }
      }
      if (propios.length > 1) {
        hallazgos.push({
          nivel: "aviso",
          texto: `Hay ${propios.length} endpoints apuntando a esta web; solo uno de sus whsec_ coincidirá con el configurado y los demás fallarán la firma.`,
        });
      }
      if (propios.length === 1 && propios[0].estado === "enabled" && propios[0].faltan.length === 0) {
        hallazgos.push({
          nivel: "ok",
          texto: `Endpoint activo en ${propios[0].url} con todos los eventos que la web procesa.`,
        });
      }
    }
  } catch (e) {
    hallazgos.push({
      nivel: "aviso",
      texto: `No se han podido listar los endpoints de webhook (${(e as Error).message}).`,
    });
  }

  // El whsec_ solo se ve al CREAR el endpoint: no hay forma de comprobar por API que el
  // secreto guardado en Vercel sea el de ESTE endpoint. Eso se valida con un pago real.
  return diag;
}
