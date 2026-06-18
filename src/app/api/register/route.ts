import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2, "Indica tu nombre"),
  email: z.string().email("Email no válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  phone: z.string().optional(),
  role: z.enum(["FAMILIA", "CUIDADORA"]), // el ADMIN no se registra públicamente
  consentRGPD: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar el tratamiento de datos (RGPD)" }),
  }),
  zones: z.array(z.string()).optional(), // solo cuidadora
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
  const { name, email, password, phone, role, zones } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con este email" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role,
      consentRGPD: true,
      consentAt: new Date(),
      // Si es cuidadora, creamos su perfil (pendiente de verificación por admin).
      ...(role === "CUIDADORA"
        ? {
            caregiverProfile: {
              create: {
                zones: zones ?? [],
                verified: false,
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
