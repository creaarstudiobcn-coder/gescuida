import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { assertStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { planKeyForPrice } from "@/lib/stripe-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mapea el estado de Stripe a nuestro enum.
function mapStatus(s: Stripe.Subscription.Status) {
  switch (s) {
    case "active":
    case "trialing":
      return "ACTIVE" as const;
    case "past_due":
    case "unpaid":
      return "PAST_DUE" as const;
    case "canceled":
    case "incomplete_expired":
      return "CANCELED" as const;
    default:
      return "INCOMPLETE" as const;
  }
}

// Sincroniza la suscripción de ACCESO de Stripe con nuestra BD (plan Básico o Completo).
// Es lo que activa (ACTIVE) o bloquea (PAST_DUE/CANCELED) el acceso de la familia y fija
// su plan (y por tanto su límite de contactos). NO gestiona el pago del cuidado.
async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  const priceId = sub.items.data[0]?.price.id;
  const planKey = priceId ? planKeyForPrice(priceId) : undefined;
  const plan = planKey ? await prisma.plan.findUnique({ where: { key: planKey } }) : null;
  if (!plan) return; // precio desconocido: no es un plan de acceso → se ignora

  const status = mapStatus(sub.status);
  const periodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : null;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  const subData = {
    status,
    planId: plan.id,
    hoursIncluded: 0, // sin bolsa de horas en el modelo plataforma
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
  };

  // Cambio de plan / nueva alta: cancela las suscripciones PREVIAS de la familia (una
  // activa a la vez). Si alguna sigue viva en Stripe, la cancelamos allí también para no
  // duplicar el cobro al subir de plan. Idempotente: tras la primera vez no hay otras activas.
  // Importante: filtramos en JS por id de Stripe, NO con `{ not: sub.id }` en el where,
  // porque en SQL `stripeSubscriptionId != 'x'` NO incluye las filas con valor NULL
  // (p. ej. la suscripción del seed), y esas también deben cancelarse al cambiar de plan.
  const activos = await prisma.subscription.findMany({
    where: {
      familyUserId: userId,
      status: { in: ["ACTIVE", "PAST_DUE", "INCOMPLETE"] },
    },
  });
  const previas = activos.filter((s) => s.stripeSubscriptionId !== sub.id);
  for (const prev of previas) {
    if (prev.stripeSubscriptionId) {
      try {
        await assertStripe().subscriptions.cancel(prev.stripeSubscriptionId);
      } catch {
        /* ya cancelada o inexistente en Stripe: continuamos */
      }
    }
  }
  if (previas.length > 0) {
    await prisma.subscription.updateMany({
      where: { id: { in: previas.map((p) => p.id) } },
      data: { status: "CANCELED" },
    });
  }

  // Alta o actualización IDEMPOTENTE: Stripe entrega varios eventos del mismo `sub` casi a la
  // vez (checkout.session.completed + subscription.created/updated). El upsert por la clave
  // única evita el find-then-create; ante una carrera (P2002) hacemos solo update.
  try {
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      create: { familyUserId: userId, stripeSubscriptionId: sub.id, ...subData },
      update: subData,
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      await prisma.subscription.update({ where: { stripeSubscriptionId: sub.id }, data: subData });
    } else {
      throw e;
    }
  }

  // Registro del pago de la cuota de acceso. Idempotente por factura (`latest_invoice`):
  // así no se duplica en la ráfaga de eventos, pero sí se registra cada renovación mensual.
  if (status === "ACTIVE") {
    const invoiceRef = (sub.latest_invoice as string | null) ?? sub.id;
    const yaRegistrado = await prisma.payment.findFirst({
      where: { type: "SUSCRIPCION", stripeRef: invoiceRef },
    });
    if (!yaRegistrado) {
      await prisma.payment.create({
        data: {
          familyUserId: userId,
          type: "SUSCRIPCION",
          amountCents: plan.priceCents,
          status: "PAGADO",
          description: `Cuota mensual de acceso — ${plan.name}`,
          stripeRef: invoiceRef,
        },
      });
    }
  }
}

export async function POST(req: Request) {
  const stripe = assertStripe();
  // .trim() defensivo: evita el error "signing secret contains whitespace" si la variable
  // de entorno se pegó con un espacio o salto de línea invisible.
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!whSecret) {
    return NextResponse.json({ error: "Falta STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, whSecret);
  } catch (e) {
    return NextResponse.json({ error: `Firma no válida: ${(e as Error).message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await syncSubscription(sub);
        }
        // (Legacy: el pago único de "horas extra" se ha retirado en el modelo plataforma.)
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELED" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }
    }
  } catch (e) {
    console.error("Error procesando webhook:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
