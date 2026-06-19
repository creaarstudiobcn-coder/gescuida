import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { hashToken } from "@/lib/tokens";

// Confirmar el restablecimiento: el usuario llega con el token del email y su nueva contraseña.
// Validamos el token (existe, no caducado, no usado), guardamos la nueva contraseña con el
// mismo bcrypt que el registro, y marcamos el token como usado (un solo uso).

const schema = z.object({
  token: z.string().min(1, "Falta el token"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
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
  const { token, password } = parsed.data;

  // Anti-bot: reCAPTCHA v3 (invisible). Si no está configurado, no bloquea.
  const rc = await verifyRecaptcha(parsed.data.recaptchaToken, "reset");
  if (!rc.ok) {
    return NextResponse.json(
      { error: "No hemos podido verificar que no eres un robot. Inténtalo de nuevo." },
      { status: 400 }
    );
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  const invalid = !record || record.usedAt !== null || record.expiresAt.getTime() < Date.now();
  if (invalid) {
    return NextResponse.json(
      { error: "El enlace no es válido o ha caducado. Solicita uno nuevo." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Actualizamos la contraseña y marcamos el token como usado en una transacción.
  // Además, invalidamos cualquier otro token pendiente de ese usuario.
  await prisma.$transaction([
    prisma.user.update({ where: { id: record!.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: record!.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record!.userId, usedAt: null },
    }),
  ]);

  return NextResponse.json({ ok: true, message: "Contraseña actualizada. Ya puedes iniciar sesión." });
}
