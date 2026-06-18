import type { ShiftStatus } from "@prisma/client";

const META: Record<ShiftStatus, { label: string; className: string }> = {
  PENDIENTE: { label: "Buscando cuidadora", className: "bg-calido-100 text-calido-700" },
  CONFIRMADO: { label: "Confirmada", className: "bg-salvia-100 text-salvia-700" },
  COMPLETADO: { label: "Completada", className: "bg-marino-100 text-marino-700" },
  CANCELADO: { label: "Cancelada", className: "bg-gray-200 text-gray-600" },
};

export function StatusBadge({ status }: { status: ShiftStatus }) {
  const m = META[status];
  return <span className={`badge ${m.className}`}>{m.label}</span>;
}
