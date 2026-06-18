// Verificación de reCAPTCHA v3 (invisible, basado en puntuación) en el servidor.
//
// Diseño pensado para NO molestar al usuario legítimo:
//  - Si no hay clave secreta configurada → no bloquea (degradación elegante en local/dev
//    y en el primer despliegue antes de poner las claves).
//  - Si Google no responde (error de red) → no bloquea (fail-open): no penalizamos a un
//    usuario legítimo por una caída puntual de Google.
//  - Solo se bloquea cuando la verificación dice explícitamente que NO es válida o la
//    puntuación está por debajo del umbral (probable bot).

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

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
  if (!token) return { ok: false, reason: "missing_token" };

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

    if (!data.success) return { ok: false, reason: "verify_failed" };
    if (expectedAction && data.action && data.action !== expectedAction) {
      return { ok: false, reason: "action_mismatch" };
    }
    if (typeof data.score === "number" && data.score < MIN_SCORE) {
      return { ok: false, score: data.score, reason: "low_score" };
    }
    return { ok: true, score: data.score };
  } catch {
    // Caída/timeout de Google: no bloqueamos al usuario legítimo.
    return { ok: true, reason: "verify_error" };
  }
}
