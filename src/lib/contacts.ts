import { prisma } from "@/lib/prisma";
import { getAccessStatus, startOfMonth, type AccessStatus } from "@/lib/access";

// Un "contacto" = una cuidadora DISTINTA a la que la familia ha enviado al menos un
// mensaje durante el ciclo de suscripción actual. Volver a escribir a una cuidadora ya
// contactada NO consume un nuevo contacto. El contador se reinicia cada ciclo mensual.

export interface ContactUsage {
  used: number; // cuidadoras distintas contactadas este ciclo
  limit: number; // máximo según el plan
  remaining: number;
  reachedLimit: boolean;
  planKey: "BASICO" | "COMPLETO" | null;
}

// IDs de las cuidadoras distintas contactadas por la familia desde el inicio del ciclo.
async function contactedCaregiverIds(
  familyUserId: string,
  since: Date
): Promise<Set<string>> {
  const rows = await prisma.message.findMany({
    where: { senderUserId: familyUserId, createdAt: { gte: since } },
    distinct: ["recipientUserId"],
    select: { recipientUserId: true },
  });
  return new Set(rows.map((r) => r.recipientUserId));
}

// Uso del cupo de contactos de la familia en el ciclo actual.
export async function getContactUsage(
  familyUserId: string,
  access?: AccessStatus
): Promise<ContactUsage> {
  const a = access ?? (await getAccessStatus(familyUserId));
  const since = a.periodStart ?? startOfMonth();
  const ids = await contactedCaregiverIds(familyUserId, since);
  const used = ids.size;
  const limit = a.contactLimit;
  const remaining = Math.max(0, limit - used);
  return {
    used,
    limit,
    remaining,
    reachedLimit: used >= limit,
    planKey: a.planKey,
  };
}

// ¿Puede la familia contactar (mensajear) a esta cuidadora ahora mismo?
// - Si ya la contactó este ciclo → siempre puede (no consume contacto nuevo).
// - Si es nueva → solo si no ha alcanzado el límite de su plan.
export async function canContactCaregiver(
  familyUserId: string,
  caregiverUserId: string
): Promise<{ allowed: boolean; isNew: boolean; usage: ContactUsage }> {
  const access = await getAccessStatus(familyUserId);
  const since = access.periodStart ?? startOfMonth();
  const ids = await contactedCaregiverIds(familyUserId, since);

  const used = ids.size;
  const limit = access.contactLimit;
  const usage: ContactUsage = {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    reachedLimit: used >= limit,
    planKey: access.planKey,
  };

  const alreadyContacted = ids.has(caregiverUserId);
  if (alreadyContacted) return { allowed: true, isNew: false, usage };

  // Cuidadora nueva: permitido solo si aún queda cupo.
  return { allowed: used < limit, isNew: true, usage };
}
