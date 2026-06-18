import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  shiftId: z.string().min(1),
  caregiverUserId: z.string().min(1),
});

// Intervención manual del admin: cubrir/reasignar un turno que nadie acepta.
export async function POST(req: Request) {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }
  const { shiftId, caregiverUserId } = parsed.data;

  const caregiver = await prisma.user.findFirst({
    where: { id: caregiverUserId, role: "CUIDADORA" },
  });
  if (!caregiver) {
    return NextResponse.json({ error: "Cuidadora no válida" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.shift.update({
      where: { id: shiftId },
      data: {
        caregiverUserId,
        status: "CONFIRMADO",
        acceptedAt: new Date(),
        acceptanceVoluntary: false, // asignación manual por administración
        alertedAdmin: false,
      },
    }),
    prisma.shiftResponse.create({
      data: { shiftId, caregiverUserId, action: "ACEPTADO", voluntary: false },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
