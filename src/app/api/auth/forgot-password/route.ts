import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { generateResetToken, resetTokenExpiry } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

// Solicitar un enlace de recuperación de contraseña.
//
// SEGURIDAD: respondemos SIEMPRE lo mismo ("si ese email está registrado, te hemos enviado
// un enlace"), exista o no la cuenta. Así nadie puede averiguar qué emails tienen cuenta
// (evita la "enumeración de usuarios").

const schema = z.object({
  email: z.string().email("Email no válido"),
  recaptchaToken: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Datos no válidos" },
      { status: 400 }
    );
  }
  const { email } = parsed.data;

  // Anti-bot: reCAPTCHA v3 (invisible). Si no está configurado, no bloquea.
  const rc = await verifyRecaptcha(parsed.data.recaptchaToken, "forgot");
  if (!rc.ok) {
    return NextResponse.json(
      { error: "No hemos podido verificar que no eres un robot. Inténtalo de nuevo." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Solo si el usuario existe generamos y enviamos el enlace. La respuesta es idéntica en
  // ambos casos (ver más abajo), así que el cliente no puede distinguir.
  if (user) {
    const { token, tokenHash } = generateResetToken();

    // Invalidamos enlaces anteriores no usados: solo el más reciente debe funcionar.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: resetTokenExpiry() },
    });

    // Construimos el enlace con el origen real de la petición (respeta www / dominio actual);
    // si no estuviera disponible, usamos NEXT_PUBLIC_APP_URL.
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    const resetUrl = `${origin}/restablecer/${token}`;

    await sendPasswordResetEmail(user.email, resetUrl);
  }

  // Respuesta genérica (anti-enumeración).
  return NextResponse.json({
    ok: true,
    message: "Si ese email está registrado, te hemos enviado un enlace para restablecer la contraseña.",
  });
}
