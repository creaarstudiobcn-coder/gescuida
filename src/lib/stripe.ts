import Stripe from "stripe";

// Cliente de Stripe (servidor). Si no hay clave, las rutas de pago devolverán error claro.
const key = process.env.STRIPE_SECRET_KEY?.trim();

export const stripe = key
  ? new Stripe(key, { apiVersion: "2025-02-24.acacia" })
  : (null as unknown as Stripe);

export function assertStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      "Stripe no está configurado. Define STRIPE_SECRET_KEY en .env.local"
    );
  }
  return stripe;
}

// Reexportado desde site-url para que el success_url del checkout nazca ya en www.
export { SITE_URL as APP_URL } from "@/lib/site-url";
