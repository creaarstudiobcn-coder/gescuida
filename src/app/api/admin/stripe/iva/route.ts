import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { assertStripe } from "@/lib/stripe";
import { priceIdForPlan } from "@/lib/stripe-helpers";
import { ACCESS_PLANS, type AccessPlanKey } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fija `tax_behavior: "inclusive"` en los precios de los dos planes de acceso.
//
// Por qué desde aquí: la clave live vive en el servidor y no se puede bajar
// (las variables de Vercel son Sensitive). Mismo patrón que el diagnóstico.
//
// OJO: Stripe solo deja cambiar tax_behavior UNA vez, saliendo de "unspecified".
// Una vez en "inclusive" o "exclusive" es inmutable, así que esto NO tiene vuelta
// atrás. No cambia lo que se cobra hoy (el checkout no usa automatic_tax): deja
// los precios listos para el día que se active Stripe Tax, para que el IVA quede
// DENTRO de los 29,99 / 69 € anunciados y no se sume por encima.
export async function POST() {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const stripe = assertStripe();
  const resultados: { plan: AccessPlanKey; nombre: string; ok: boolean; mensaje: string }[] = [];

  for (const plan of ["BASICO", "COMPLETO"] as AccessPlanKey[]) {
    const nombre = ACCESS_PLANS[plan].name;
    const priceId = priceIdForPlan(plan);

    if (!priceId) {
      resultados.push({ plan, nombre, ok: false, mensaje: `Falta STRIPE_PRICE_${plan} en el entorno.` });
      continue;
    }

    try {
      const actual = await stripe.prices.retrieve(priceId);

      if (actual.tax_behavior === "inclusive") {
        resultados.push({ plan, nombre, ok: true, mensaje: "Ya estaba con el IVA incluido." });
        continue;
      }
      if (actual.tax_behavior === "exclusive") {
        resultados.push({
          plan,
          nombre,
          ok: false,
          mensaje: "Está en «exclusive» y Stripe no deja volver atrás. Habría que crear un precio nuevo.",
        });
        continue;
      }

      const actualizado = await stripe.prices.update(priceId, { tax_behavior: "inclusive" });
      const ok = actualizado.tax_behavior === "inclusive";
      resultados.push({
        plan,
        nombre,
        ok,
        mensaje: ok
          ? "Fijado a «inclusive»: el IVA queda dentro del precio anunciado."
          : `Stripe lo dejó en «${actualizado.tax_behavior ?? "sin definir"}».`,
      });
    } catch (e) {
      resultados.push({ plan, nombre, ok: false, mensaje: (e as Error).message });
    }
  }

  return NextResponse.json({ resultados });
}
