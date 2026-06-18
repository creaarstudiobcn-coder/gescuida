// Verificación de reCAPTCHA v3 (invisible) en el servidor.
//
// FILOSOFÍA: NO impedir registros/acciones legítimas por problemas de CONFIGURACIÓN.
//  - Sin clave secreta            → no bloquea (no configurado).
//  - El cliente no envía token    → no bloquea (falta el site key en el cliente, etc.).
//  - Google dice "no válido"      → no bloquea (clave/dominio mal configurados). Se registra.
//  - Error de red con Google      → no bloquea (caída puntual).
//  - Token VÁLIDO pero score bajo → solo bloquea si RECAPTCHA_ENFORCE === "true".
//
// Así, mientras se ajusta la configuración, reCAPTCHA funciona en "modo monitor"
// (puntúa y deja rastro en los logs) sin cerrar la puerta a nadie. Cuando esté todo bien,
// se pone RECAPTCHA_ENFORCE=true para que SÍ bloquee a los bots (score bajo).

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");
const ENFORCE = process.env.RECAPTCHA_ENFORCE === "true";

export interface RecaptchaResult {
  ok: boolean;
  score?: number;
  reason?: string;
}

export async function verifyRecaptcha(
  token: string | undefined | null,
  expectedAction?: string
): Promise<RecaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: true, reason: "not_configured" };

  if (!token) {
    // El cliente no mandó token. Casi siempre: falta NEXT_PUBLIC_RECAPTCHA_SITE_KEY en el
    // build (o no se ha redeployado). NO bloqueamos para no impedir registros legítimos.
    console.warn("[recaptcha] sin token del cliente — ¿falta NEXT_PUBLIC_RECAPTCHA_SITE_KEY o redeploy? No se bloquea.");
    return { ok: true, reason: "missing_token" };
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
    });
    const data = (await res.json()) as {
      success: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

    if (!data.success) {
      // Problema de configuración (clave/dominio): NO bloqueamos; dejamos rastro.
      console.warn(`[recaptcha] verificación NO válida (config). error-codes=${JSON.stringify(data["error-codes"] ?? [])}. No se bloquea.`);
      return { ok: true, reason: "verify_failed" };
    }

    const score = data.score;
    const actionMismatch = !!(expectedAction && data.action && data.action !== expectedAction);
    const lowScore = typeof score === "number" && score < MIN_SCORE;

    if (lowScore || actionMismatch) {
      console.warn(
        `[recaptcha] sospechoso: score=${score} action=${data.action} esperado=${expectedAction} enforce=${ENFORCE}`
      );
      // Token válido pero sospechoso (probable bot). Solo bloquea en modo enforce.
      return { ok: !ENFORCE, score, reason: actionMismatch ? "action_mismatch" : "low_score" };
    }

    return { ok: true, score };
  } catch {
    // Caída/timeout de Google: no bloqueamos al usuario legítimo.
    return { ok: true, reason: "verify_error" };
  }
}
