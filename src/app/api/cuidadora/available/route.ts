import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { shiftForCaregiver } from "@/lib/shifts";

// Turnos disponibles cerca de la cuidadora (sin asignar, en sus municipios).
// La dirección NO se incluye: solo la zona aproximada, hasta que acepte.
export async function GET() {
  const { user, res } = await apiAuth("CUIDADORA");
  if (res) return res;

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: user.id } });
  const zones = profile?.zones ?? [];

  // Turnos que ya rechazó: no se los volvemos a mostrar.
  const rejected = await prisma.shiftResponse.findMany({
    where: { caregiverUserId: user.id, action: "RECHAZADO" },
    select: { shiftId: true },
  });
  const rejectedIds = rejected.map((r) => r.shiftId);

  const shifts = await prisma.shift.findMany({
    where: {
      status: "PENDIENTE",
      caregiverUserId: null,
      start: { gte: new Date() },
      ...(zones.length ? { zone: { in: zones } } : {}),
      id: { notIn: rejectedIds.length ? rejectedIds : undefined },
    },
    include: { careRecipient: { select: { name: true, age: true, zone: true } } },
    orderBy: { start: "asc" }, // "cercanía" temporal; las de su zona ya están filtradas
  });

  const viewerRate = {
    minCents: profile?.hourlyRateMinCents ?? null,
    maxCents: profile?.hourlyRateMaxCents ?? null,
  };

  return NextResponse.json({
    verified: profile?.verified ?? false,
    zones,
    rateMin: viewerRate.minCents != null ? viewerRate.minCents / 100 : null,
    rateMax: viewerRate.maxCents != null ? viewerRate.maxCents / 100 : null,
    shifts: shifts.map((s) => shiftForCaregiver(s, user.id, viewerRate)),
  });
}
