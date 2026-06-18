"use client";

import { fmtDate, fmtRange } from "@/lib/format";
import { formatHourlyRange } from "@/lib/pricing";
import { AssignButton } from "./AssignButton";
import { timeAgo } from "./ui";
import type { ShiftAdmin } from "./types";

// Presentación visual por estado: borde lateral de acento + etiqueta clara.
// El objetivo es que el admin distinga en medio segundo qué turno necesita acción.
const STATUS_UI: Record<
  ShiftAdmin["status"],
  { border: string; badge: string; label: string }
> = {
  PENDIENTE: {
    border: "border-l-calido-500",
    badge: "bg-calido-100 text-calido-700",
    label: "Sin cubrir",
  },
  CONFIRMADO: {
    border: "border-l-salvia-500",
    badge: "bg-salvia-100 text-salvia-700",
    label: "✓ Cubierto",
  },
  COMPLETADO: {
    border: "border-l-gray-300",
    badge: "bg-gray-100 text-gray-500",
    label: "Completado",
  },
  CANCELADO: {
    border: "border-l-gray-300",
    badge: "bg-gray-200 text-gray-600",
    label: "Cancelado",
  },
};

// Tarjeta de turno del tablero de administración.
export function ShiftCard({
  shift,
  onAssigned,
}: {
  shift: ShiftAdmin;
  onAssigned?: () => void;
}) {
  const isPending = shift.status === "PENDIENTE";
  const isConfirmed = shift.status === "CONFIRMADO";
  const overdue =
    isPending &&
    (shift.alertedAdmin ||
      (shift.alertDeadline ? new Date(shift.alertDeadline).getTime() < Date.now() : false));

  const ui = STATUS_UI[shift.status];

  return (
    <article
      className={`card border-l-4 ${ui.border} ${
        overdue
          ? "border-calido-300 bg-calido-50 ring-1 ring-calido-200"
          : isPending
            ? "bg-calido-50/50"
            : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold capitalize text-marino-800">{fmtDate(shift.start)}</p>
          <p className="text-sm text-marino-600">
            {fmtRange(shift.start, shift.end)} · {shift.durationHours} h
          </p>
        </div>
        <span className={`badge shrink-0 ${overdue ? "bg-calido-200 text-calido-800" : ui.badge}`}>
          {overdue ? "⚠️ Urgente" : ui.label}
        </span>
      </div>

      {/* Cuidadora asignada destacada (turnos cubiertos / completados) */}
      {shift.caregiver && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-salvia-700">
          <span aria-hidden>🤝</span> {shift.caregiver.name}
          {isConfirmed && <span aria-hidden>✓</span>}
        </p>
      )}

      <dl className="mt-2 space-y-0.5 text-sm text-marino-600">
        <div className="flex gap-1.5">
          <dt className="font-semibold text-marino-500">Persona:</dt>
          <dd>👵 {shift.recipientName ?? "—"}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="font-semibold text-marino-500">Zona:</dt>
          <dd>📍 {shift.zone}</dd>
        </div>
        {shift.caregiver && (
          <div className="flex gap-1.5">
            <dt className="font-semibold text-marino-500">Tarifa cuidadora:</dt>
            <dd className="font-semibold text-marino-700">
              {formatHourlyRange(shift.caregiver.rateMinCents, shift.caregiver.rateMaxCents)}
            </dd>
          </div>
        )}
        {shift.careSummary && (
          <p className="mt-1 line-clamp-2 text-marino-500">{shift.careSummary}</p>
        )}
      </dl>

      {isPending && (
        <p className={`mt-2 text-xs font-semibold ${overdue ? "text-calido-700" : "text-marino-400"}`}>
          {overdue ? "Plazo vencido · " : ""}
          Creado {timeAgo(shift.createdAt)}
          {shift.alertDeadline && !overdue && ` · plazo ${timeAgo(shift.alertDeadline)}`}
        </p>
      )}

      {isPending && (
        <div className="mt-3">
          <AssignButton shiftId={shift.id} onAssigned={onAssigned} />
        </div>
      )}
      {isConfirmed && (
        <div className="mt-3">
          <AssignButton shiftId={shift.id} reassign onAssigned={onAssigned} />
        </div>
      )}
    </article>
  );
}
