// Cifrado de datos sensibles (RGPD — datos de salud) con AES-256-GCM.
// La clave se deriva de ENCRYPTION_KEY (32 bytes en hex o base64).
import crypto from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "Falta ENCRYPTION_KEY. Genera una con: openssl rand -hex 32"
    );
  }
  // Acepta hex (64 chars) o base64; si no, deriva por hash para no romper en dev.
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  const b64 = Buffer.from(raw, "base64");
  if (b64.length === 32) return b64;
  return crypto.createHash("sha256").update(raw).digest();
}

// Devuelve "iv:authTag:ciphertext" en base64. null/'' → null.
export function encrypt(plain: string | null | undefined): string | null {
  if (plain == null || plain === "") return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(":");
}

export function decrypt(payload: string | null | undefined): string | null {
  if (!payload) return null;
  try {
    const [ivB64, tagB64, dataB64] = payload.split(":");
    const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64")),
      decipher.final(),
    ]);
    return dec.toString("utf8");
  } catch {
    return null; // dato corrupto o clave incorrecta
  }
}
