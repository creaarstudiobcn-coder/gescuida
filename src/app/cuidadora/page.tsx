"use client";

import Link from "next/link";
import { useState } from "react";
import { usePolling } from "@/components/usePolling";
import { fmtDateLong, fmtRange } from "@/lib/format";
import { formatHourlyRange } from "@/lib/pricing";
import { Loading, ErrorCard, EmptyCard, Notice } from "./_components/Feedback";
import { DAY_LABEL, type AvailableResponse, type CuidadoraShift } from "./_components/types";

export default function TurnosDisponiblesPage() {
  const { data, error, loading, refresh } = usePolling<AvailableResponse>(
    "/api/cuidadora/available",
    5000
  );

  // Aviso global tras aceptar/rechazar.
  const [notice, setNotice] = useState<{ tone: "success" | "error"; msg: string } | null>(null);
  // id del turno en proceso (para deshabilitar sus botones).
  const [busyId, setBusyId] = useState<string | null>(null);

  const verified = data?.verified ?? true;
  const zones = data?.zones ?? [];
  const shifts = data?.shifts ?? [];

  async function respond(shiftId: string, action: "ACEPTADO" | "RECHAZADO") {
    setBusyId(shiftId);
    setNotice(null);
    try {
      const res = await fetch("/api/cuidadora/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId, action }),
      });

      if (res.ok) {
        if (action === "ACEPTADO") {
          setNotice({ tone: "success", msg: "¡Turno aceptado! Ya está en tu agenda." });
        }
        await refresh();
      } else if (res.status === 403) {
        setNotice({
          tone: "error",
          msg: "Tu perfil aún no está verificado, no puedes aceptar turnos todavía.",
        });
      } else if (res.status === 409) {
        setNotice({
          tone: "error",
          msg: "Este turno ya ha sido tomado por otra cuidadora. Te mostramos la lista actualizada.",
        });
        await refresh();
      } else {
        let detail = "";
        try {
          const j = (await res.json()) as { error?: string };
          detail = j?.error ? ` (${j.error})` : "";
        } catch {
          /* sin cuerpo */
        }
        setNotice({
          tone: "error",
          msg: `No hemos podido completar la acción${detail}. Inténtalo de nuevo.`,
        });
      }
    } catch {
      setNotice({
        tone: "error",
        msg: "Problema de conexión. Revisa tu internet e inténtalo de nuevo.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Turnos disponibles</h1>
        <p className="mt-1 text-marino-500">
          Turnos cerca de ti, en tiempo real. Aceptarlos es completamente voluntario.
        </p>
      </div>

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.msg}
        </Notice>
      )}

      {!verified && (
        <div className="card border-calido-300 bg-calido-50" role="alert">
          <p className="text-lg font-bold text-marino-800">⏳ Perfil pendiente de verificación</p>
          <p className="mt-1 text-marino-600">
            Puedes <strong>ver</strong> los turnos disponibles, pero todavía no puedes aceptarlos.
            En cuanto administración verifique tu perfil, podrás empezar a aceptar turnos.
          </p>
        </div>
      )}

      {verified && zones.length === 0 && (
        <div className="card border-marino-200 bg-marino-50">
          <p className="font-semibold text-marino-800">Aún no has elegido tus municipios</p>
          <p className="mt-1 text-sm text-marino-600">
            Configura las zonas donde trabajas para empezar a recibir turnos cercanos.
          </p>
          <Link href="/cuidadora/perfil" className="btn-primary mt-3 inline-block">
            Configurar municipios
          </Link>
        </div>
      )}

      {loading && !data ? (
        <Loading label="Buscando turnos disponibles…" />
      ) : error && !data ? (
        <ErrorCard message={error} />
      ) : shifts.length === 0 ? (
        <EmptyCard title="No hay turnos disponibles ahora mismo">
          Esta lista se actualiza sola cada pocos segundos. En cuanto haya un turno en tus zonas,
          aparecerá aquí.
        </EmptyCard>
      ) : (
        <ul className="space-y-4">
          {shifts.map((s) => (
            <ShiftCard
              key={s.id}
              shift={s}
              verified={verified}
              busy={busyId === s.id}
              onAccept={() => respond(s.id, "ACEPTADO")}
              onReject={() => respond(s.id, "RECHAZADO")}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ShiftCard({
  shift,
  verified,
  busy,
  onAccept,
  onReject,
}: {
  shift: CuidadoraShift;
  verified: boolean;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <li className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold capitalize text-marino-800">
            {fmtDateLong(shift.start)}
          </p>
          <p className="text-marino-600">
            {fmtRange(shift.start, shift.end)} · {shift.durationHours} h
          </p>
        </div>
        <span className="badge bg-marino-100 text-marino-700">{DAY_LABEL[shift.dayType]}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="badge bg-salvia-100 text-salvia-700">📍 Zona: {shift.zone}</span>
      </div>
      <p className="mt-1 text-xs text-marino-400">
        Por privacidad, solo verás la zona aproximada. La dirección exacta y el nombre de la persona
        se muestran cuando aceptas el turno.
      </p>

      {shift.careSummary && (
        <p className="mt-3 rounded-xl bg-crema-100 px-3 py-2 text-sm text-marino-700">
          {shift.careSummary}
        </p>
      )}

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-marino-100 pt-3">
        <div>
          <p className="text-xs font-semibold text-marino-500">Tu tarifa por hora</p>
          <p className="text-2xl font-extrabold text-calido-600">
            {formatHourlyRange(shift.rateMinCents, shift.rateMaxCents)}
          </p>
          <p className="mt-0.5 text-xs text-marino-400">
            La fijas tú en tu perfil. El importe lo acuerdas y cobras directamente de la familia.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onAccept}
          disabled={!verified || busy}
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Aceptar turno"
        >
          {busy ? "Procesando…" : "Aceptar turno"}
        </button>
        {/* El botón Rechazar SIEMPRE está visible y disponible: la participación es voluntaria. */}
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          className="btn-secondary flex-1 disabled:opacity-50"
          aria-label="Rechazar turno"
        >
          Rechazar
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-marino-400">
        Al aceptar, confirmas que lo haces de forma voluntaria.
      </p>
    </li>
  );
}
