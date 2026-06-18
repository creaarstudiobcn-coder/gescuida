import type { PlanKey } from "@prisma/client";
import type { AccessPlanKey } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { assertStripe } from "@/lib/stripe";

// Modelo plataforma: dos precios recurrentes (Básico 29,99 € y Completo 69 €).
// Los price_ id se definen en STRIPE_PRICE_BASICO y STRIPE_PRICE_COMPLETO.
export function priceIdForPlan(key: AccessPlanKey): string | undefined {
  return key === "BASICO" ? process.env.STRIPE_PRICE_BASICO : process.env.STRIPE_PRICE_COMPLETO;
}

// Mapea un Stripe Price ID a su PlanKey (Básico / Completo).
export function planKeyForPrice(priceId: string): PlanKey | undefined {
  if (!priceId) return undefined;
  if (priceId === process.env.STRIPE_PRICE_BASICO) return "BASICO";
  if (priceId === process.env.STRIPE_PRICE_COMPLETO) return "COMPLETO";
  return undefined;
}

// Obtiene (o crea) el cliente de Stripe asociado a un usuario.
export async function getOrCreateCustomer(userId: string): Promise<string> {
  const stripe = assertStripe();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}
