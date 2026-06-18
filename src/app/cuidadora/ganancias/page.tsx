"use client";

import Link from "next/link";
import { usePolling } from "@/components/usePolling";
import { formatEuros } from "@/lib/pricing";
import { Loading, ErrorCard } from "../_components/Feedback";
import { type EarningsResponse } from "../_components/types";

export default function GananciasPage() {
  const { data, error, loading } = usePolling<EarningsResponse>("/api/cuidadora/earnings", 15000);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Mis turnos e ingresos</h1>
        <p className="mt-1 text-marino-500">
          Tus horas y una estimación con tu tarifa. La plataforma es gratuita para ti.
        </p>
      </div>

      {loading && !data ? (
        <Loading label="Calculando…" />
      ) : error && !data ? (
        <ErrorCard message={error} />
      ) : data ? (
        <Panel data={data} />
      ) : null}
    </div>
  );
}

function Panel({ data }: { data: EarningsResponse }) {
  const totalHours = data.completed.hours + data.upcoming.hours;
  const hasRate = data.rateMin != null || data.rateMax != null;

  // Estimación de ingresos = horas × tu tarifa (rango). Solo orientativa.
  const estMin = data.rateMin != null ? Math.round(totalHours * data.rateMin * 100) : null;
  const estMax = data.rateMax != null ? Math.round(totalHours * data.rateMax * 100) : null;

  function estLabel(): string {
    if (estMin != null && estMax != null) {
      return estMin === estMax ? formatEuros(estMin) : `${formatEuros(estMin)} – ${formatEuros(estMax)}`;
    }
    if (estMin != null) return `Desde ${formatEuros(estMin)}`;
    if (estMax != null) return `Hasta ${formatEuros(estMax)}`;
    return "—";
  }

  return (
    <div className="space-y-4">
      {/* Aviso: la plataforma no intermedia el cobro */}
      <div className="card border-marino-200 bg-marino-50 text-sm text-marino-700">
        <p className="font-bold text-marino-800">Cómo cobras</p>
        <p className="mt-1">
          <strong>Acuerdas y cobras directamente de la familia</strong>: la plataforma no gestiona
          ni retiene ese pago, y <strong>no te cobra ninguna comisión ni cuota</strong>. Tú fijas tu
          tarifa en tu perfil.
        </p>
      </div>

      {/* Estimación con tu tarifa */}
      <div className="card bg-marino-800 text-white">
        <p className="text-sm font-semibold text-marino-100">Estimación con tu tarifa</p>
        {hasRate ? (
          <>
            <p className="mt-1 text-4xl font-extrabold">{estLabel()}</p>
            <p className="mt-1 text-sm text-marino-200">
              {totalHours} h en total (realizadas + próximas) × tu tarifa. Solo orientativo.
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-2xl font-extrabold">A convenir</p>
            <p className="mt-1 text-sm text-marino-200">
              Aún no has fijado tu tarifa.{" "}
              <Link href="/cuidadora/perfil" className="underline">
                Defínela en tu perfil
              </Link>{" "}
              para ver una estimación.
            </p>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card bg-salvia-50">
          <p className="text-sm font-semibold text-salvia-700">Realizado · turnos completados</p>
          <p className="mt-1 text-3xl font-extrabold text-marino-800">{data.completed.count}</p>
          <p className="text-sm text-marino-600">{data.completed.hours} h</p>
        </div>
        <div className="card bg-calido-50">
          <p className="text-sm font-semibold text-calido-700">Próximos · turnos confirmados</p>
          <p className="mt-1 text-3xl font-extrabold text-marino-800">{data.upcoming.count}</p>
          <p className="text-sm text-marino-600">{data.upcoming.hours} h</p>
        </div>
      </div>

      {/* Espacio reservado para futura monetización del lado cuidadora (sin activar) */}
      <div className="card border-dashed border-marino-200 bg-white opacity-80" aria-hidden>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-marino-700">Herramientas Pro para cuidadoras</p>
            <p className="mt-1 text-sm text-marino-500">
              Perfil destacado, cobros integrados y más visibilidad. Estamos preparándolo.
            </p>
          </div>
          <span className="badge shrink-0 bg-marino-100 text-marino-500">Próximamente</span>
        </div>
      </div>

      <p className="text-center text-xs text-marino-400">
        Importes orientativos. Los datos se actualizan automáticamente.
      </p>
    </div>
  );
}
