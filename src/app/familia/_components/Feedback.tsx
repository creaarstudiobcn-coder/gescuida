// Estados de carga, vacío y error reutilizables en el panel de familia.

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
    <div
      className="card border-calido-300 bg-calido-50 text-calido-800"
      role="alert"
    >
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
