import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { assertStripe, APP_URL } from "@/lib/stripe";
import { getOrCreateCustomer, priceIdForPlan } from "@/lib/stripe-helpers";

const schema = z.object({ planKey: z.enum(["BASICO", "COMPLETO"]) });

// Inicia el checkout de la SUSCRIPCIÓN DE ACCESO a la plataforma (plan Básico o Completo).
// Sirve tanto para suscribirse como para CAMBIAR de plan (upgrade Básico → Completo):
// al activarse la nueva suscripción, el webhook cancela la anterior (en Stripe y en BD).
// Esta cuota da acceso a contactar cuidadoras y coordinar; NO es el pago del cuidado.
export async function POST(req: Request) {
  const { user, res } = await apiAuth("FAMILIA");
  if (res) return res;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Plan no válido" }, { status: 400 });

  const priceId = priceIdForPlan(parsed.data.planKey);
  if (!priceId) {
    return NextResponse.json(
      { error: `Falta STRIPE_PRICE_${parsed.data.planKey} en las variables de entorno.` },
      { status: 500 }
    );
  }

  try {
    const stripe = assertStripe();
    const customerId = await getOrCreateCustomer(user.id);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/familia/suscripcion?status=success`,
      cancel_url: `${APP_URL}/familia/suscripcion?status=cancel`,
      metadata: { userId: user.id, planKey: parsed.data.planKey, kind: "subscription" },
      subscription_data: {
        metadata: { userId: user.id, planKey: parsed.data.planKey },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
