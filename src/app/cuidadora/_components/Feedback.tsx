// Estados de carga, vacío y error reutilizables en el panel de cuidadora.

export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="card flex items-center gap-3 text-marino-500" role="status" aria-live="polite">
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-marino-200 border-t-calido-500"
      />
      <span>{label}</span>
    </div>
  );
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="card border-calido-300 bg-calido-50 text-calido-800" role="alert">
      <p className="font-semibold">No hemos podido cargar la información</p>
      <p className="mt-1 text-sm">{message}</p>
      <p className="mt-2 text-sm text-marino-500">
        Vuelve a intentarlo en unos segundos. Si persiste, contacta con nosotros.
      </p>
    </div>
  );
}

export function EmptyCard({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card border-dashed text-center text-marino-500">
      <p className="font-semibold text-marino-700">{title}</p>
      {children && <div className="mt-1 text-sm">{children}</div>}
    </div>
  );
}

// Aviso amable (no bloqueante) para mensajes de éxito/error de acciones.
export function Notice({
  tone = "info",
  children,
  onClose,
}: {
  tone?: "success" | "error" | "info";
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const styles =
    tone === "success"
      ? "border-salvia-300 bg-salvia-50 text-salvia-800"
      : tone === "error"
        ? "border-calido-300 bg-calido-50 text-calido-800"
        : "border-marino-200 bg-marino-50 text-marino-700";
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}
      role="status"
      aria-live="polite"
    >
      <span className="font-medium">{children}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar aviso"
          className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
