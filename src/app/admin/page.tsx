"use client";

import Link from "next/link";
import { usePolling } from "@/components/usePolling";
import { fmtDate, fmtRange } from "@/lib/format";
import { formatEuros, formatHourlyRange } from "@/lib/pricing";
import { AssignButton } from "./_components/AssignButton";
import { Loading, ErrorCard, EmptyCard, timeAgo } from "./_components/ui";
import type { OverviewData, ShiftAdmin, FamilySubscription } from "./_components/types";

export default function AdminDashboard() {
  const { data, error, loading, refresh } = usePolling<OverviewData>("/api/admin/overview", 5000);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-marino-800">Panel de control 📊</h1>
          <p className="mt-1 text-marino-500">Estado del servicio en tiempo real.</p>
        </div>
        <span className="hidden text-xs font-semibold text-salvia-600 sm:inline">
          🔄 Actualiza cada 5 s
        </span>
      </div>

      {loading && !data ? (
        <Loading label="Cargando indicadores…" />
      ) : error && !data ? (
        <ErrorCard message={error} />
      ) : data ? (
        <>
          <KpiRow data={data} />
          <SubscriptionsSection subscriptions={data.subscriptions} />
          <AlertsSection alerts={data.alerts} onAssigned={refresh} />
          <SummarySection data={data} />
        </>
      ) : null}
    </div>
  );
}

function KpiRow({ data }: { data: OverviewData }) {
  const { kpis } = data;
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="card bg-marino-800 text-white sm:col-span-2 lg:col-span-1">
        <p className="text-sm font-semibold text-salvia-200">MRR · cuotas de acceso</p>
        <p className="mt-1 text-3xl font-extrabold">{formatEuros(kpis.mrrCents)}</p>
        <p className="text-xs text-marino-200">
          {kpis.familiasBasico} Básico · {kpis.familiasCompleto} Completo
        </p>
      </div>
      <Kpi
        label="Familias por plan"
        value={`${kpis.familiasBasico} / ${kpis.familiasCompleto}`}
        sub={
          kpis.familiasImpagadas > 0
            ? `Básico / Completo · ${kpis.familiasImpagadas} impagadas`
            : "Básico / Completo"
        }
        icon="👨‍👩‍👧"
      />
      <Kpi
        label="Cuidadoras (gratis)"
        value={`${kpis.cuidadorasVerificadas}/${kpis.cuidadorasTotal}`}
        sub="verificadas / total"
        icon="🤝"
      />
      <Kpi
        label="En su límite"
        value={kpis.familiasEnLimite}
        sub="familias que podrían subir"
        icon="⬆️"
      />
    </section>
  );
}

function SubscriptionsSection({ subscriptions }: { subscriptions: FamilySubscription[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-marino-800">💳 Suscripciones de familias</h2>
      {subscriptions.length === 0 ? (
        <EmptyCard>Todavía no hay familias suscritas.</EmptyCard>
      ) : (
        <ul className="grid gap-2 lg:grid-cols-2">
          {subscriptions.map((s) => (
            <li
              key={s.email}
              className="card flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-marino-800">{s.name}</p>
                <p className="truncate text-sm text-marino-500">{s.email}</p>
              </div>
              <div className="shrink-0 text-right">
                {s.status === "ACTIVE" ? (
                  <span className="badge bg-salvia-100 text-salvia-700">{s.planName} · activa</span>
                ) : (
                  <span className="badge bg-calido-200 text-calido-800">{s.planName} · impagada</span>
                )}
                {s.status === "ACTIVE" && (
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      s.contactLimit > 0 && s.contactsUsed >= s.contactLimit
                        ? "text-calido-700"
                        : "text-marino-400"
                    }`}
                  >
                    {s.contactsUsed}/{s.contactLimit} contactos
                  </p>
                )}
                {s.periodEnd && (
                  <p className="mt-0.5 text-xs text-marino-400">Renueva {fmtDate(s.periodEnd)}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Kpi({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-marino-500">{label}</p>
        <span aria-hidden className="text-lg">
          {icon}
        </span>
      </div>
      <p className="mt-1 text-3xl font-extrabold text-marino-800">{value}</p>
      {sub && <p className="text-xs text-marino-400">{sub}</p>}
    </div>
  );
}

function AlertsSection({
  alerts,
  onAssigned,
}: {
  alerts: ShiftAdmin[];
  onAssigned: () => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-marino-800">⚠️ Turnos sin cubrir (alerta)</h2>
      {alerts.length === 0 ? (
        <div className="card border-salvia-300 bg-salvia-50 text-salvia-700">
          <p className="font-semibold">✅ Todo cubierto</p>
          <p className="mt-1 text-sm">
            No hay turnos cuyo plazo haya vencido. El servicio está al día.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {alerts.map((s) => (
            <li
              key={s.id}
              className="card border-calido-400 bg-calido-50"
              role="alert"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold capitalize text-marino-800">
                    {fmtDate(s.start)} · {fmtRange(s.start, s.end)}
                  </p>
                  <p className="mt-0.5 text-sm text-marino-600">
                    👵 {s.recipientName ?? "—"} · 📍 {s.zone} · {s.durationHours} h
                  </p>
                  <p className="mt-1 text-xs font-semibold text-calido-700">
                    Sin cuidadora · creado {timeAgo(s.createdAt)}
                  </p>
                </div>
                <span className="badge shrink-0 bg-calido-200 text-calido-800">Urgente</span>
              </div>
              <div className="mt-3">
                <AssignButton shiftId={s.id} onAssigned={onAssigned} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SummarySection({ data }: { data: OverviewData }) {
  const nextConfirmed = [...data.confirmed]
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/turnos" className="card transition hover:border-calido-300">
          <p className="text-sm font-semibold text-marino-500">Buscando cuidadora</p>
          <p className="mt-1 text-2xl font-extrabold text-calido-600">{data.pending.length}</p>
          <p className="text-xs text-marino-400">pendientes</p>
        </Link>
        <Link href="/admin/turnos" className="card transition hover:border-salvia-300">
          <p className="text-sm font-semibold text-marino-500">Confirmados</p>
          <p className="mt-1 text-2xl font-extrabold text-salvia-600">{data.confirmed.length}</p>
          <p className="text-xs text-marino-400">con cuidadora</p>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-marino-800">Próximos confirmados</h2>
        <Link href="/admin/turnos" className="text-sm font-semibold text-calido-600">
          Ver tablero
        </Link>
      </div>
      {nextConfirmed.length === 0 ? (
        <EmptyCard>No hay turnos confirmados próximos.</EmptyCard>
      ) : (
        <ul className="space-y-2">
          {nextConfirmed.map((s) => (
            <li key={s.id} className="card flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-semibold capitalize text-marino-800">
                  {fmtDate(s.start)} · {fmtRange(s.start, s.end)}
                </p>
                <p className="truncate text-sm text-marino-500">
                  👵 {s.recipientName ?? "—"} · 📍 {s.zone}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-salvia-700">
                  {s.caregiver?.name ?? "—"}
                </p>
                <p className="text-xs text-marino-400">
                  {s.caregiver
                    ? formatHourlyRange(s.caregiver.rateMinCents, s.caregiver.rateMaxCents)
                    : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
