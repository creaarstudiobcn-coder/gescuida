import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { diagnosticarStripe } from "@/lib/stripe-diagnostico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Comprueba en producción que Stripe está bien configurado (clave, precios, webhook).
// Solo ADMIN. Solo lectura: no crea nada en Stripe y no devuelve ningún secreto.
export async function GET() {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  try {
    return NextResponse.json(await diagnosticarStripe());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
