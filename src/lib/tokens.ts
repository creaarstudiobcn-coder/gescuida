import crypto from "crypto";

// Tokens seguros para enlaces de un solo uso (recuperación de contraseña).
//
// El token EN CLARO solo viaja en el enlace del email; en la base de datos guardamos
// únicamente su hash SHA-256. Para validar, hasheamos el token recibido y lo comparamos.
// Así, una filtración de la tabla no permite usar los enlaces.

// Minutos de validez del enlace de recuperación.
export const RESET_TOKEN_TTL_MINUTES = 60;

export interface ResetTokenPair {
  token: string; // se envía en el email (URL-safe)
  tokenHash: string; // se guarda en la BD
}

export function generateResetToken(): ResetTokenPair {
  // 32 bytes aleatorios → ~256 bits de entropía, imposible de adivinar.
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function resetTokenExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}
