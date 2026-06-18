import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import type { Shift, ShiftStatus } from "@prisma/client";

// ── Serialización segura según quién mira ──

type CaregiverRel = {
  id: string;
  name: string;
  caregiverProfile?: { hourlyRateMinCents: number | null; hourlyRateMaxCents: number | null } | null;
} | null;

type ShiftWithRelations = Shift & {
  careRecipient?: { name: string; age: number | null; zone: string } | null;
  caregiver?: CaregiverRel;
};

// Rango de tarifa de la cuidadora asignada (lo fija ella; null si no lo ha definido).
function caregiverWithRate(c: CaregiverRel) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    rateMinCents: c.caregiverProfile?.hourlyRateMinCents ?? null,
    rateMaxCents: c.caregiverProfile?.hourlyRateMaxCents ?? null,
  };
}

// Vista para la FAMILIA dueña del turno (ve todo lo suyo, incl. la tarifa de la cuidadora).
export function shiftForFamily(s: ShiftWithRelations) {
  return {
    id: s.id,
    start: s.start,
    end: s.end,
    durationHours: s.durationHours,
    zone: s.zone,
    status: s.status,
    dayType: s.dayType,
    careSummary: s.careSummary,
    recipientName: s.careRecipient?.name ?? null,
    caregiver: caregiverWithRate(s.caregiver ?? null),
    hoursFromPlan: s.hoursFromPlan,
    hoursFromExtra: s.hoursFromExtra,
  };
}

// Vista para la CUIDADORA. `viewerRate` es SU propia tarifa (la que ella fija en su perfil).
// IMPORTANTE (RGPD): la dirección y datos sensibles SOLO se revelan si está asignada.
export function shiftForCaregiver(
  s: ShiftWithRelations,
  viewerId: string,
  viewerRate?: { minCents: number | null; maxCents: number | null }
) {
  const isAssigned = s.caregiverUserId === viewerId;
  return {
    id: s.id,
    start: s.start,
    end: s.end,
    durationHours: s.durationHours,
    zone: s.zone, // municipio (aproximado) — visible siempre
    status: s.status,
    dayType: s.dayType,
    careSummary: s.careSummary,
    // Su propia tarifa por hora (la fija ella; el importe se acuerda con la familia):
    rateMinCents: viewerRate?.minCents ?? null,
    rateMaxCents: viewerRate?.maxCents ?? null,
    isAssigned,
    // Datos completos solo si está asignada:
    address: isAssigned ? decrypt(s.addressEnc) : null,
    recipientName: isAssigned ? s.careRecipient?.name ?? null : null,
  };
}

// Vista para el ADMIN (supervisión completa, incl. la tarifa de la cuidadora asignada).
export function shiftForAdmin(s: ShiftWithRelations) {
  return {
    id: s.id,
    start: s.start,
    end: s.end,
    durationHours: s.durationHours,
    zone: s.zone,
    status: s.status,
    dayType: s.dayType,
    careSummary: s.careSummary,
    recipientName: s.careRecipient?.name ?? null,
    caregiver: caregiverWithRate(s.caregiver ?? null),
    alertedAdmin: s.alertedAdmin,
    alertDeadline: s.alertDeadline,
    createdAt: s.createdAt,
  };
}

// ── Aceptación voluntaria de un turno por una cuidadora ──
export async function acceptShift(shiftId: string, caregiverUserId: string) {
  return prisma.$transaction(async (tx) => {
    const shift = await tx.shift.findUnique({ where: { id: shiftId } });
    if (!shift) throw new Error("El turno no existe");
    if (shift.status !== "PENDIENTE" || shift.caregiverUserId) {
      throw new Error("Este turno ya no está disponible");
    }

    const updated = await tx.shift.update({
      where: { id: shiftId },
      data: {
        caregiverUserId,
        status: "CONFIRMADO",
        acceptedAt: new Date(),
        acceptanceVoluntary: true, // constancia de voluntariedad
      },
    });

    // Deja registro de la aceptación voluntaria (timestamp).
    await tx.shiftResponse.create({
      data: { shiftId, caregiverUserId, action: "ACEPTADO", voluntary: true },
    });

    return updated;
  });
}

// Rechazo voluntario: deja constancia, no cambia el estado del turno.
export async function rejectShift(shiftId: string, caregiverUserId: string) {
  await prisma.shiftResponse.create({
    data: { shiftId, caregiverUserId, action: "RECHAZADO", voluntary: true },
  });
  return { ok: true };
}

export const STATUS_META: Record<
  ShiftStatus,
  { label: string; className: string }
> = {
  PENDIENTE: { label: "Buscando cuidadora", className: "bg-calido-100 text-calido-700" },
  CONFIRMADO: { label: "Confirmada", className: "bg-salvia-100 text-salvia-700" },
  COMPLETADO: { label: "Completada", className: "bg-marino-100 text-marino-700" },
  CANCELADO: { label: "Cancelada", className: "bg-gray-200 text-gray-600" },
};
