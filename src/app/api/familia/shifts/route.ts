import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getAccessStatus } from "@/lib/access";
import { shiftForFamily } from "@/lib/shifts";
import { getDayType, ALERT_HOURS_UNCOVERED } from "@/lib/pricing";

// Lista los turnos de la familia (con la cuidadora asignada y su tarifa, si la hay).
export async function GET() {
  const { user, res } = await apiAuth("FAMILIA");
  if (res) return res;

  const shifts = await prisma.shift.findMany({
    where: { familyUserId: user.id },
    include: {
      careRecipient: { select: { name: true, age: true, zone: true } },
      caregiver: {
        select: {
          id: true,
          name: true,
          caregiverProfile: {
            select: { hourlyRateMinCents: true, hourlyRateMaxCents: true },
          },
        },
      },
    },
    orderBy: { start: "desc" },
  });

  return NextResponse.json(shifts.map(shiftForFamily));
}

const bookSchema = z.object({
  careRecipientId: z.string().min(1),
  start: z.string().datetime(), // ISO
  durationHours: z.coerce.number().min(0.5).max(12),
  careSummary: z.string().max(280).optional(),
});

// CREAR RESERVA (flujo central): requiere ACCESO activo a la plataforma.
// No descuenta horas (no hay bolsa): la cuota de acceso permite reservar sin límite.
export async function POST(req: Request) {
  const { user, res } = await apiAuth("FAMILIA");
  if (res) return res;

  const parsed = bookSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de reserva no válidos" }, { status: 400 });
  }
  const { careRecipientId, start, durationHours, careSummary } = parsed.data;

  const recipient = await prisma.careRecipient.findFirst({
    where: { id: careRecipientId, familyUserId: user.id },
  });
  if (!recipient) {
    return NextResponse.json({ error: "Persona a cuidar no encontrada" }, { status: 404 });
  }

  const startDate = new Date(start);
  if (startDate.getTime() < Date.now()) {
    return NextResponse.json({ error: "La fecha debe ser futura" }, { status: 400 });
  }
  const endDate = new Date(startDate.getTime() + durationHours * 3600 * 1000);
  const dayType = getDayType(startDate);

  // Única comprobación de cobro: la cuota de ACCESO a la plataforma debe estar al día.
  const access = await getAccessStatus(user.id);
  if (!access.subscriptionActive) {
    return NextResponse.json(
      {
        error: "Necesitas la cuota de acceso a la plataforma activa para reservar.",
        code: "NO_SUBSCRIPTION",
      },
      { status: 402 }
    );
  }

  const shift = await prisma.shift.create({
    data: {
      careRecipientId: recipient.id,
      familyUserId: user.id,
      start: startDate,
      end: endDate,
      durationHours,
      dayType,
      zone: recipient.zone,
      addressEnc: recipient.addressEnc, // se revelará solo a la cuidadora que acepte
      status: "PENDIENTE",
      // La plataforma NO fija tarifa: el precio lo pone cada cuidadora en su perfil
      // y el importe se acuerda directamente entre familia y cuidadora.
      careSummary: careSummary ?? null,
      alertDeadline: new Date(Date.now() + ALERT_HOURS_UNCOVERED * 3600 * 1000),
    },
  });

  return NextResponse.json({ id: shift.id }, { status: 201 });
}
