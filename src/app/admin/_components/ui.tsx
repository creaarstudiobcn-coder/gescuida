// Componentes de UI auxiliares para el panel de administración.

export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="card flex items-center gap-3 text-marino-500" role="status" aria-live="polite">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-salvia-300 border-t-salvia-600"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="card border-calido-300 bg-calido-50 text-calido-700" role="alert">
      <p className="font-semibold">No se han podido cargar los datos</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

export function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="card border-dashed text-center text-marino-500">
      <p className="text-sm">{children}</p>
    </div>
  );
}

// "Hace cuánto" en español a partir de una fecha ISO.
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return "";
  const past = diffMs >= 0;
  const abs = Math.abs(diffMs);
  const min = Math.floor(abs / 60000);
  const hours = Math.floor(min / 60);
  const days = Math.floor(hours / 24);

  let value: string;
  if (min < 1) value = "hace un momento";
  else if (min < 60) value = `hace ${min} min`;
  else if (hours < 24) value = `hace ${hours} h`;
  else value = `hace ${days} ${days === 1 ? "día" : "días"}`;

  // Si la fecha es futura (p.ej. un plazo que aún no vence), lo indicamos.
  if (!past) {
    if (min < 1) return "ahora mismo";
    if (min < 60) return `en ${min} min`;
    if (hours < 24) return `en ${hours} h`;
    return `en ${days} ${days === 1 ? "día" : "días"}`;
  }
  return value;
}
