import type { ShiftStatus, DayType } from "@prisma/client";

export interface ShiftAdmin {
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
    rateMinCents: number | null;
    rateMaxCents: number | null;
  } | null;
  alertedAdmin: boolean;
  alertDeadline: string | null;
  createdAt: string;
}

export interface FamilySubscription {
  name: string;
  email: string;
  status: "ACTIVE" | "PAST_DUE";
  planName: string;
  contactsUsed: number;
  contactLimit: number;
  periodEnd: string | null;
}

export interface OverviewData {
  kpis: {
    familiasBasico: number;
    familiasCompleto: number;
    familiasImpagadas: number;
    cuidadorasTotal: number; // gratis
    cuidadorasVerificadas: number;
    turnosSemana: number;
    mrrCents: number;
    familiasEnLimite: number;
  };
  subscriptions: FamilySubscription[];
  alerts: ShiftAdmin[];
  pending: ShiftAdmin[];
  confirmed: ShiftAdmin[];
  completed: ShiftAdmin[];
}

export interface CaregiverAdmin {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  zones: string[];
  verified: boolean;
  suspended: boolean;
  shiftsCount: number;
}

export interface CaregiverDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  shiftsCount: number;
  verified: boolean;
  verifiedAt: string | null;
  suspended: boolean;
  zones: string[];
  bio: string | null;
  training: string | null;
  photoUrl: string | null;
  availability: unknown;
  hourlyRateMinCents: number | null;
  hourlyRateMaxCents: number | null;
}
