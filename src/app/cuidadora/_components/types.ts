// Tipos compartidos del panel de cuidadora (según el contrato de API).

export type ShiftStatus = "PENDIENTE" | "CONFIRMADO" | "COMPLETADO" | "CANCELADO";
export type DayType = "LABORABLE" | "SABADO" | "DOMINGO";

export interface CuidadoraShift {
  id: string;
  start: string;
  end: string;
  durationHours: number;
  zone: string;
  status: ShiftStatus;
  dayType: DayType;
  careSummary: string | null;
  // Tarifa por hora que fija la propia cuidadora (null = a convenir).
  rateMinCents: number | null;
  rateMaxCents: number | null;
  isAssigned: boolean;
  address: string | null;
  recipientName: string | null;
}

export interface AvailableResponse {
  verified: boolean;
  zones: string[];
  shifts: CuidadoraShift[];
}

export interface CuidadoraProfile {
  name: string;
  zones: string[];
  bio: string;
  training: string;
  photoUrl: string;
  availability: Availability;
  rateMin: number | null; // tarifa por hora (euros) que fija la cuidadora
  rateMax: number | null;
  verified: boolean;
  suspended: boolean;
}

export type Availability = Record<string, string[]>;

export interface EarningsResponse {
  completed: { count: number; hours: number };
  upcoming: { count: number; hours: number };
  // Tarifa por hora de la cuidadora (euros) para estimar, si la ha definido.
  rateMin: number | null;
  rateMax: number | null;
}

export const DAY_LABEL: Record<DayType, string> = {
  LABORABLE: "Laborable",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};
