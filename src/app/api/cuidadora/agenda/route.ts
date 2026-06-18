import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { shiftForCaregiver } from "@/lib/shifts";

// Agenda de la cuidadora: turnos que ha aceptado (confirmados / completados).
export async function GET() {
  const { user, res } = await apiAuth("CUIDADORA");
  if (res) return res;

  const [profile, shifts] = await Promise.all([
    prisma.caregiverProfile.findUnique({ where: { userId: user.id } }),
    prisma.shift.findMany({
      where: {
        caregiverUserId: user.id,
        status: { in: ["CONFIRMADO", "COMPLETADO"] },
      },
      include: { careRecipient: { select: { name: true, age: true, zone: true } } },
      orderBy: { start: "asc" },
    }),
  ]);

  const viewerRate = {
    minCents: profile?.hourlyRateMinCents ?? null,
    maxCents: profile?.hourlyRateMaxCents ?? null,
  };

  return NextResponse.json(shifts.map((s) => shiftForCaregiver(s, user.id, viewerRate)));
}
