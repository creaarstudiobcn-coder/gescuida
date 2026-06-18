import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// Panel de ganancias de la cuidadora.
export async function GET() {
  const { user, res } = await apiAuth("CUIDADORA");
  if (res) return res;

  const [profile, completed, upcoming] = await Promise.all([
    prisma.caregiverProfile.findUnique({ where: { userId: user.id } }),
    prisma.shift.aggregate({
      where: { caregiverUserId: user.id, status: "COMPLETADO" },
      _sum: { durationHours: true },
      _count: true,
    }),
    prisma.shift.aggregate({
      where: { caregiverUserId: user.id, status: "CONFIRMADO" },
      _sum: { durationHours: true },
      _count: true,
    }),
  ]);

  // Horas y turnos. La estimación de importe se calcula con la tarifa que fija la cuidadora.
  return NextResponse.json({
    completed: { count: completed._count, hours: completed._sum.durationHours ?? 0 },
    upcoming: { count: upcoming._count, hours: upcoming._sum.durationHours ?? 0 },
    rateMin: profile?.hourlyRateMinCents != null ? profile.hourlyRateMinCents / 100 : null,
    rateMax: profile?.hourlyRateMaxCents != null ? profile.hourlyRateMaxCents / 100 : null,
  });
}
