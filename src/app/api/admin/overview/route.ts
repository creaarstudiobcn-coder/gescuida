import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { shiftForAdmin } from "@/lib/shifts";
import { ACCESS_PLANS } from "@/lib/pricing";
import { getContactUsage } from "@/lib/contacts";
import { getAccessStatus } from "@/lib/access";

export async function GET() {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

  const [activeSubs, pastDueSubs, caregiversTotal, caregiversVerified, shiftsWeek, pending, confirmed, completedRecent] =
    await Promise.all([
      // Familias con la cuota al día (de pago), con su plan.
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: { plan: true, family: { select: { id: true, name: true, email: true } } },
        orderBy: { currentPeriodEnd: "asc" },
      }),
      prisma.subscription.findMany({
        where: { status: "PAST_DUE" },
        include: { plan: true, family: { select: { id: true, name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.user.count({ where: { role: "CUIDADORA" } }),
      prisma.caregiverProfile.count({ where: { verified: true } }),
      prisma.shift.count({ where: { start: { gte: now, lt: weekEnd } } }),
      prisma.shift.findMany({
        where: { status: "PENDIENTE" },
        include: {
          careRecipient: { select: { name: true, age: true, zone: true } },
          caregiver: {
          select: {
            id: true,
            name: true,
            caregiverProfile: { select: { hourlyRateMinCents: true, hourlyRateMaxCents: true } },
          },
        },
        },
        orderBy: { start: "asc" },
      }),
      prisma.shift.findMany({
        where: { status: "CONFIRMADO" },
        include: {
          careRecipient: { select: { name: true, age: true, zone: true } },
          caregiver: {
          select: {
            id: true,
            name: true,
            caregiverProfile: { select: { hourlyRateMinCents: true, hourlyRateMaxCents: true } },
          },
        },
        },
        orderBy: { start: "asc" },
      }),
      prisma.shift.findMany({
        where: { status: "COMPLETADO" },
        include: {
          careRecipient: { select: { name: true, age: true, zone: true } },
          caregiver: {
          select: {
            id: true,
            name: true,
            caregiverProfile: { select: { hourlyRateMinCents: true, hourlyRateMaxCents: true } },
          },
        },
        },
        orderBy: { start: "desc" },
        take: 20,
      }),
    ]);

  const familiasBasico = activeSubs.filter((s) => s.plan.key === "BASICO").length;
  const familiasCompleto = activeSubs.filter((s) => s.plan.key === "COMPLETO").length;

  // MRR = familias Básico × precio Básico + familias Completo × precio Completo.
  const mrrCents =
    familiasBasico * ACCESS_PLANS.BASICO.priceCents +
    familiasCompleto * ACCESS_PLANS.COMPLETO.priceCents;

  // Familias que han llegado a su límite de contactos (candidatas a subir de plan).
  const usages = await Promise.all(
    activeSubs.map(async (s) => {
      const access = await getAccessStatus(s.family.id);
      return getContactUsage(s.family.id, access);
    })
  );
  const familiasEnLimite = usages.filter((u) => u.limit > 0 && u.reachedLimit).length;

  const pendingSerialized = pending.map(shiftForAdmin);
  const alerts = pendingSerialized.filter(
    (s) => s.alertDeadline && new Date(s.alertDeadline).getTime() < now.getTime()
  );

  // Estado de la suscripción de cada familia (activa / impagada) con su plan y uso.
  const subscriptions = [
    ...activeSubs.map((s, i) => ({
      name: s.family.name,
      email: s.family.email,
      status: "ACTIVE" as const,
      planName: s.plan.name,
      contactsUsed: usages[i]?.used ?? 0,
      contactLimit: usages[i]?.limit ?? 0,
      periodEnd: s.currentPeriodEnd,
    })),
    ...pastDueSubs.map((s) => ({
      name: s.family.name,
      email: s.family.email,
      status: "PAST_DUE" as const,
      planName: s.plan.name,
      contactsUsed: 0,
      contactLimit: 0,
      periodEnd: s.currentPeriodEnd,
    })),
  ];

  return NextResponse.json({
    kpis: {
      familiasBasico,
      familiasCompleto,
      familiasImpagadas: pastDueSubs.length,
      cuidadorasTotal: caregiversTotal, // gratis
      cuidadorasVerificadas: caregiversVerified,
      turnosSemana: shiftsWeek,
      mrrCents,
      familiasEnLimite,
    },
    subscriptions,
    alerts,
    pending: pendingSerialized,
    confirmed: confirmed.map(shiftForAdmin),
    completed: completedRecent.map(shiftForAdmin),
  });
}
