import { prisma } from "@/lib/prisma";
import { contactLimitForPlan } from "@/lib/pricing";

// Estado de ACCESO de una familia a la plataforma.
// Con la cuota de acceso activa, la familia puede reservar visitas sin límite de horas,
// pero solo puede CONTACTAR (mensajear) a un nº limitado de cuidadoras distintas al mes,
// según su plan (Básico o Completo).
export interface AccessStatus {
  hasSubscription: boolean; // existe alguna suscripción (aunque esté impagada)
  subscriptionActive: boolean; // cuota al día → puede usar la plataforma
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "NONE";
  planKey: "BASICO" | "COMPLETO" | null;
  planName: string | null;
  contactLimit: number; // máx. de cuidadoras distintas a contactar por ciclo
  periodStart: Date | null; // inicio del ciclo (para reiniciar el contador)
  periodEnd: Date | null; // renovación
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getAccessStatus(familyUserId: string): Promise<AccessStatus> {
  const sub = await prisma.subscription.findFirst({
    where: { familyUserId, status: { in: ["ACTIVE", "PAST_DUE"] } },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!sub) {
    return {
      hasSubscription: false,
      subscriptionActive: false,
      status: "NONE",
      planKey: null,
      planName: null,
      contactLimit: 0,
      periodStart: null,
      periodEnd: null,
    };
  }

  const planKey = sub.plan.key === "BASICO" || sub.plan.key === "COMPLETO" ? sub.plan.key : null;

  return {
    hasSubscription: true,
    subscriptionActive: sub.status === "ACTIVE",
    status: sub.status === "ACTIVE" ? "ACTIVE" : "PAST_DUE",
    planKey,
    planName: sub.plan.name,
    contactLimit: contactLimitForPlan(sub.plan.key),
    periodStart: sub.currentPeriodStart ?? null,
    periodEnd: sub.currentPeriodEnd ?? null,
  };
}
