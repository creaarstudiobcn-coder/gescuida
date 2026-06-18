import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { shiftForCaregiverPreview } from "@/lib/shifts";

// Turnos disponibles cerca de la cuidadora (sin asignar, en sus municipios).
// SEGURIDAD: aquí NO se carga ni se devuelve la dirección ni el nombre de la persona;
// solo la zona aproximada. La dirección completa solo se revela tras ACEPTAR el turno
// (ver /api/cuidadora/agenda + shiftForCaregiver, que descifra solo a la cuidadora asignada).
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
    // Solo campos SEGUROS antes de aceptar. NO se selecciona `addressEnc` ni la relación
    // `careRecipient`: la dirección y el nombre ni siquiera salen de la base de datos.
    select: {
      id: true,
      start: true,
      end: true,
      durationHours: true,
      zone: true,
      status: true,
      dayType: true,
      careSummary: true,
    },
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
    shifts: shifts.map((s) => shiftForCaregiverPreview(s, viewerRate)),
  });
}
