// Tipos compartidos del panel de familia (espejo del contrato de la API).

import type { ShiftStatus, DayType } from "@prisma/client";

// Uso del cupo de contactos del ciclo (cuidadoras distintas mensajeadas).
export interface ContactUsage {
  used: number;
  limit: number;
  remaining: number;
  reachedLimit: boolean;
  planKey: "BASICO" | "COMPLETO" | null;
}

// Estado de la cuota de acceso a la plataforma + cupo de contactos.
export interface Access {
  hasSubscription: boolean;
  subscriptionActive: boolean;
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "NONE";
  planKey: "BASICO" | "COMPLETO" | null;
  planName: string | null;
  contactLimit: number;
  periodStart: string | null;
  periodEnd: string | null;
  contacts: ContactUsage;
}

export interface Recipient {
  id: string;
  name: string;
  age: number | null;
  zone: string;
  address: string | null;
  needs: string | null;
  notes: string | null;
}

export interface Shift {
  id: string;
  start: string;
  end: string;
  durationHours: number;
  zone: string;
  status: ShiftStatus;
  dayType: DayType;
  careSummary: string | null;
  recipientName: string | null;
  caregiver: {
    id: string;
    name: string;
    rateMinCents: number | null; // tarifa por hora que fija la cuidadora (null = a convenir)
    rateMaxCents: number | null;
  } | null;
  hoursFromPlan: number;
  hoursFromExtra: number;
}
