// Configuración central de precios y reglas de negocio.
// Todo en céntimos para evitar errores de coma flotante.
//
// MODELO PLATAFORMA DE CONEXIÓN:
// - La plataforma NO emplea a las cuidadoras ni presta el servicio de cuidado.
// - Las FAMILIAS eligen un plan de ACCESO mensual (Básico o Completo) con límite de contactos.
// - El cuidado en sí (tarifa por hora) se acuerda y se paga directamente entre
//   familia y cuidadora; la plataforma NO lo cobra. Esas tarifas son solo de referencia.

import type { DayType } from "@prisma/client";

// IVA configurable (variable de entorno, por defecto 10%).
export const IVA_RATE = Number(process.env.NEXT_PUBLIC_IVA_RATE ?? "0.10");

// ── Planes de acceso a la plataforma (suscripción mensual de la familia) ──
// Dos planes. Precio (euros) y límite de contactos/mes configurables por entorno.
// Cada variable tiene su versión NEXT_PUBLIC_ para poder mostrarse en el cliente
// (en el navegador solo están disponibles las NEXT_PUBLIC_*).
export type AccessPlanKey = "BASICO" | "COMPLETO";

const envNum = (server: string | undefined, pub: string | undefined, fallback: number) =>
  Number(server ?? pub ?? fallback);

export const ACCESS_PLANS: Record<
  AccessPlanKey,
  { key: AccessPlanKey; name: string; priceCents: number; contactLimit: number; description: string }
> = {
  BASICO: {
    key: "BASICO",
    name: "Plan Básico",
    priceCents: Math.round(
      envNum(process.env.PLAN_BASICO_PRECIO, process.env.NEXT_PUBLIC_PLAN_BASICO_PRECIO, 29.99) * 100
    ),
    contactLimit: envNum(
      process.env.PLAN_BASICO_CONTACTOS,
      process.env.NEXT_PUBLIC_PLAN_BASICO_CONTACTOS,
      3
    ),
    description: "Acceso a la plataforma para contactar con un número reducido de cuidadoras.",
  },
  COMPLETO: {
    key: "COMPLETO",
    name: "Plan Completo",
    priceCents: Math.round(
      envNum(process.env.PLAN_COMPLETO_PRECIO, process.env.NEXT_PUBLIC_PLAN_COMPLETO_PRECIO, 69) * 100
    ),
    contactLimit: envNum(
      process.env.PLAN_COMPLETO_CONTACTOS,
      process.env.NEXT_PUBLIC_PLAN_COMPLETO_CONTACTOS,
      10
    ),
    description: "Más visibilidad: contacta con muchas más cuidadoras cada mes.",
  },
};

// Devuelve el plan de acceso por su clave (o undefined si no es un plan de acceso válido).
export function accessPlan(key: string | null | undefined) {
  if (key === "BASICO" || key === "COMPLETO") return ACCESS_PLANS[key];
  return undefined;
}

// Límite de contactos/mes para una clave de plan (0 si no hay plan válido).
export function contactLimitForPlan(key: string | null | undefined): number {
  return accessPlan(key)?.contactLimit ?? 0;
}

// ── Tarifa del cuidado: la fija SOLO la cuidadora (rango por hora en su perfil) ──
// La plataforma NO establece ninguna tarifa. El importe del cuidado se acuerda y se
// paga directamente entre familia y cuidadora; la plataforma no interviene en ese pago.

// Determina el tipo de día a partir de una fecha (para clasificar el turno: L-V/sáb/dom).
export function getDayType(date: Date): DayType {
  const d = date.getDay(); // 0 = domingo … 6 = sábado
  if (d === 0) return "DOMINGO";
  if (d === 6) return "SABADO";
  return "LABORABLE";
}

// Formatea el rango de tarifa por hora de una cuidadora. Si no lo ha definido → "A convenir".
export function formatHourlyRange(
  minCents: number | null | undefined,
  maxCents: number | null | undefined
): string {
  const hasMin = typeof minCents === "number" && minCents > 0;
  const hasMax = typeof maxCents === "number" && maxCents > 0;
  if (!hasMin && !hasMax) return "A convenir";
  if (hasMin && hasMax) {
    if (minCents === maxCents) return `${formatEuros(minCents)}/h`;
    return `${formatEuros(minCents)} – ${formatEuros(maxCents)}/h`;
  }
  if (hasMin) return `Desde ${formatEuros(minCents as number)}/h`;
  return `Hasta ${formatEuros(maxCents as number)}/h`;
}

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

// Horas máximas a partir de las cuales saltará la alerta al admin si nadie acepta.
export const ALERT_HOURS_UNCOVERED = Number(process.env.ALERT_HOURS_UNCOVERED ?? "12");

// Municipios del Maresme servidos (para selección de zona).
export const MUNICIPIOS_MARESME = [
  "Mataró",
  "Argentona",
  "Cabrera de Mar",
  "Vilassar de Mar",
  "Vilassar de Dalt",
  "Premià de Mar",
  "Premià de Dalt",
  "El Masnou",
  "Cabrils",
  "Òrrius",
  "Dosrius",
  "Caldes d'Estrac",
  "Sant Andreu de Llavaneres",
  "Sant Vicenç de Montalt",
  "Arenys de Mar",
  "Arenys de Munt",
  "Canet de Mar",
  "Sant Pol de Mar",
  "Calella",
  "Pineda de Mar",
  "Tordera",
  "Malgrat de Mar",
];
