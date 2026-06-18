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

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
