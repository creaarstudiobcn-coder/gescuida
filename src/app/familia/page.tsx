"use client";

import Link from "next/link";
import { usePolling } from "@/components/usePolling";
import { StatusBadge } from "@/components/StatusBadge";
import { fmtDate, fmtRange } from "@/lib/format";
import { formatHourlyRange } from "@/lib/pricing";
import { Loading, ErrorCard } from "./_components/Feedback";
import type { Access, Shift } from "./_components/types";

export default function InicioPage() {
  const access = usePolling<Access>("/api/familia/access", 10000);
  const shifts = usePolling<Shift[]>("/api/familia/shifts", 10000);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Hola 👋</h1>
        <p className="mt-1 text-marino-500">Este es el resumen de tu cuidado.</p>
      </div>

      {access.loading && !access.data ? (
        <Loading label="Cargando tu acceso…" />
      ) : access.error && !access.data ? (
        <ErrorCard message={access.error} />
      ) : access.data ? (
        <AccesoCard a={access.data} />
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-marino-800">Próximas visitas</h2>
          <Link href="/familia/visitas" className="text-sm font-semibold text-calido-600">
            Ver todas
          </Link>
        </div>

        {shifts.loading && !shifts.data ? (
          <Loading label="Cargando visitas…" />
        ) : shifts.error && !shifts.data ? (
          <ErrorCard message={shifts.error} />
        ) : (
          <ProximasVisitas shifts={shifts.data ?? []} />
        )}
      </section>

      <Link href="/familia/reservar" className="btn-primary w-full text-lg" aria-label="Reservar una visita">
        📅 Reservar una visita
      </Link>
    </div>
  );
}

function AccesoCard({ a }: { a: Access }) {
  if (!a.subscriptionActive) {
    const impagada = a.status === "PAST_DUE";
    return (
      <div className="card border-calido-300 bg-calido-50">
        <p className="text-lg font-bold text-marino-800">
          {impagada ? "Tu cuota de acceso está pendiente de pago" : "Aún no tienes acceso activo"}
        </p>
        <p className="mt-1 text-marino-600">
          Elige un plan de acceso para buscar cuidadoras, reservar visitas y coordinaros. No
          incluye el servicio de cuidado, que acuerdas y pagas directamente con la cuidadora.
        </p>
        <Link href="/familia/suscripcion" className="btn-primary mt-4">
          💳 {impagada ? "Regularizar mi cuota" : "Ver planes de acceso"}
        </Link>
      </div>
    );
  }

  const c = a.contacts;
  const pct = c.limit > 0 ? Math.min(100, Math.round((c.used / c.limit) * 100)) : 0;
  const canUpgrade = a.planKey === "BASICO";

  return (
    <div className="card bg-salvia-50">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-salvia-700">{a.planName ?? "Acceso"} · activo ✓</p>
          <p className="mt-1 text-sm text-marino-500">
            Reservas sin límite de horas. Contactos de cuidadoras según tu plan.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-marino-500">Renovación</p>
          <p className="text-base font-bold text-marino-700">
            {a.periodEnd ? fmtDate(a.periodEnd) : "—"}
          </p>
        </div>
      </div>

      {/* Contador de contactos del ciclo */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-marino-600">Contactos este mes</p>
          <p className="text-sm font-bold text-marino-800">
            {c.used} / {c.limit}
          </p>
        </div>
        <div
          className="mt-1 h-3 w-full overflow-hidden rounded-full bg-salvia-100"
          role="progressbar"
          aria-valuenow={c.used}
          aria-valuemin={0}
          aria-valuemax={c.limit}
          aria-label="Cuidadoras contactadas este mes"
        >
          <div
            className={`h-full rounded-full transition-all ${
              c.reachedLimit ? "bg-calido-500" : "bg-salvia-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-marino-500">
          {c.reachedLimit
            ? "Has llegado al límite de tu plan."
            : `Te quedan ${c.remaining} ${c.remaining === 1 ? "contacto" : "contactos"} este mes.`}
        </p>
      </div>

      {c.reachedLimit && canUpgrade && (
        <div className="mt-3 rounded-xl border border-calido-300 bg-calido-50 p-3">
          <p className="text-sm font-semibold text-calido-800">
            ¿Necesitas contactar con más cuidadoras?
          </p>
          <Link href="/familia/suscripcion" className="btn-primary mt-2">
            ⬆️ Subir a Plan Completo
          </Link>
        </div>
      )}

      <div className="mt-4">
        <Link href="/familia/suscripcion" className="btn-ghost px-4 py-2 text-sm">
          Ver mi plan
        </Link>
      </div>
    </div>
  );
}

function ProximasVisitas({ shifts }: { shifts: Shift[] }) {
  const now = Date.now();
  const proximas = shifts
    .filter(
      (s) =>
        (s.status === "PENDIENTE" || s.status === "CONFIRMADO") &&
        new Date(s.start).getTime() >= now
    )
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3);

  if (proximas.length === 0) {
    return (
      <div className="card border-dashed text-center text-marino-500">
        <p className="font-semibold text-marino-700">No tienes visitas programadas</p>
        <p className="mt-1 text-sm">Cuando reserves una, aparecerá aquí.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {proximas.map((s) => (
        <li key={s.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-marino-800">{fmtDate(s.start)}</p>
              <p className="text-marino-600">
                {fmtRange(s.start, s.end)} · {s.durationHours} h
              </p>
              {s.recipientName && (
                <p className="mt-1 text-sm text-marino-500">
                  👵 {s.recipientName} · {s.zone}
                </p>
              )}
              {s.status === "CONFIRMADO" && s.caregiver && (
                <p className="mt-1 text-sm font-semibold text-salvia-700">
                  Cuidadora: {s.caregiver.name}
                  <span className="font-normal text-marino-500">
                    {" "}· {formatHourlyRange(s.caregiver.rateMinCents, s.caregiver.rateMaxCents)}
                  </span>
                </p>
              )}
            </div>
            <StatusBadge status={s.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
