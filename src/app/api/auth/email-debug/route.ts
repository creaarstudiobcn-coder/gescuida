import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";

// ⚠️ ENDPOINT DE DIAGNÓSTICO TEMPORAL — BORRAR cuando el email funcione.
//
// Permite comprobar DESDE EL NAVEGADOR, sin acceso a los logs de Vercel:
//   · si RESEND_API_KEY está presente en el deploy en vivo (sin revelar su valor)
//   · qué remitente (EMAIL_FROM) se usa
//   · y, opcionalmente, qué responde Resend ante un envío real
//
// Está protegido por un secreto: requiere ?token=<EMAIL_DEBUG_TOKEN>. Sin el secreto
// correcto devuelve 404 (no revela ni que existe). NUNCA devuelve la clave en claro.
//
// Uso:
//   GET /api/auth/email-debug?token=SECRETO
//       → estado de la configuración (clave presente, remitente, etc.)
//   GET /api/auth/email-debug?token=SECRETO&to=tucorreo@gmail.com
//       → además intenta un envío REAL por el mismo camino que la recuperación,
//         y devuelve el resultado de Resend (ok / skipped / error).

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const expected = process.env.EMAIL_DEBUG_TOKEN?.trim();

  // Si no hay secreto configurado o no coincide → 404 (puerta cerrada y silenciosa).
  if (!expected || token !== expected) {
    return new NextResponse("Not found", { status: 404 });
  }

  const key = process.env.RESEND_API_KEY?.trim();

  const diagnostics: Record<string, unknown> = {
    hasResendKey: !!key,
    resendKeyLength: key?.length ?? 0,
    resendKeyLooksValid: !!key && key.startsWith("re_"),
    emailFrom: process.env.EMAIL_FROM?.trim() || "GesCuida <no-responder@gescuida.es> (default)",
    nodeEnv: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  };

  // Si se indica ?to=, hacemos un envío REAL por el mismo camino que la recuperación.
  const to = url.searchParams.get("to");
  if (to) {
    const result = await sendPasswordResetEmail(
      to,
      "https://www.gescuida.es/restablecer/DEBUG-TEST-TOKEN-no-valido"
    );
    diagnostics.sendAttemptedTo = to;
    diagnostics.sendResult = result; // { ok, skipped?, error? }
  }

  return NextResponse.json(diagnostics);
}
