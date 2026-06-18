"use client";

import { useState } from "react";
import { usePolling } from "@/components/usePolling";
import { StatusBadge } from "@/components/StatusBadge";
import { ChatThread } from "@/components/ChatThread";
import { fmtDateLong, fmtRange } from "@/lib/format";
import { formatHourlyRange } from "@/lib/pricing";
import { Loading, ErrorCard, EmptyCard, Notice } from "../_components/Feedback";
import { type CuidadoraShift } from "../_components/types";

export default function AgendaPage() {
  const { data, error, loading, refresh } = usePolling<CuidadoraShift[]>(
    "/api/cuidadora/agenda",
    8000
  );

  const [notice, setNotice] = useState<{ tone: "success" | "error"; msg: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const shifts = data ?? [];
  const upcoming = shifts
    .filter((s) => s.status === "CONFIRMADO")
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const completed = shifts
    .filter((s) => s.status === "COMPLETADO")
    .sort((a, b) => +new Date(b.start) - +new Date(a.start));

  async function markComplete(shiftId: string) {
    if (!window.confirm("¿Confirmas que has completado este turno? Esta acción no se puede deshacer.")) {
      return;
    }
    setBusyId(shiftId);
    setNotice(null);
    try {
      const res = await fetch("/api/shifts/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId, action: "COMPLETE" }),
      });
      if (res.ok) {
        setNotice({ tone: "success", msg: "Turno marcado como completado. ¡Buen trabajo!" });
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
          msg: `No hemos podido marcar el turno como completado${detail}. Inténtalo de nuevo.`,
        });
      }
    } catch {
      setNotice({ tone: "error", msg: "Problema de conexión. Inténtalo de nuevo." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Mi agenda</h1>
        <p className="mt-1 text-marino-500">Los turnos que has aceptado.</p>
      </div>

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.msg}
        </Notice>
      )}

      {loading && !data ? (
        <Loading label="Cargando tu agenda…" />
      ) : error && !data ? (
        <ErrorCard message={error} />
      ) : shifts.length === 0 ? (
        <EmptyCard title="Todavía no tienes turnos en tu agenda">
          Cuando aceptes un turno, aparecerá aquí con todos los detalles.
        </EmptyCard>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-marino-800">Próximos</h2>
            {upcoming.length === 0 ? (
              <EmptyCard title="No tienes turnos próximos" />
            ) : (
              <ul className="space-y-4">
                {upcoming.map((s) => (
                  <UpcomingCard
                    key={s.id}
                    shift={s}
                    busy={busyId === s.id}
                    onComplete={() => markComplete(s.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-marino-800">Completados</h2>
            {completed.length === 0 ? (
              <EmptyCard title="Aún no has completado turnos" />
            ) : (
              <ul className="space-y-3">
                {completed.map((s) => (
                  <CompletedCard key={s.id} shift={s} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function UpcomingCard({
  shift,
  busy,
  onComplete,
}: {
  shift: CuidadoraShift;
  busy: boolean;
  onComplete: () => void;
}) {
  const [showChat, setShowChat] = useState(false);

  return (
    <li className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold capitalize text-marino-800">{fmtDateLong(shift.start)}</p>
          <p className="text-marino-600">
            {fmtRange(shift.start, shift.end)} · {shift.durationHours} h
          </p>
        </div>
        <StatusBadge status="CONFIRMADO" />
      </div>

      <dl className="mt-3 space-y-1.5 rounded-xl bg-crema-100 px-3 py-2.5 text-sm">
        {shift.recipientName && (
          <div className="flex gap-2">
            <dt className="font-semibold text-marino-500">Persona:</dt>
            <dd className="text-marino-800">{shift.recipientName}</dd>
          </div>
        )}
        {shift.address && (
          <div className="flex gap-2">
            <dt className="font-semibold text-marino-500">Dirección:</dt>
            <dd className="text-marino-800">{shift.address}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="font-semibold text-marino-500">Zona:</dt>
          <dd className="text-marino-800">{shift.zone}</dd>
        </div>
      </dl>

      {shift.careSummary && (
        <p className="mt-2 text-sm text-marino-600">{shift.careSummary}</p>
      )}

      <p className="mt-3 text-sm">
        <span className="font-semibold text-marino-500">Tu tarifa: </span>
        <span className="font-bold text-calido-600">
          {formatHourlyRange(shift.rateMinCents, shift.rateMaxCents)}
        </span>
        <span className="mt-0.5 block text-xs text-marino-400">
          El importe lo acuerdas y cobras directamente de la familia.
        </span>
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setShowChat((v) => !v)}
          className="btn-secondary flex-1"
          aria-expanded={showChat}
        >
          💬 {showChat ? "Ocultar mensajes" : "Mensajear"}
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={busy}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {busy ? "Guardando…" : "✓ Marcar como completado"}
        </button>
      </div>

      {showChat && (
        <div className="mt-3">
          <ChatThread shiftId={shift.id} />
        </div>
      )}
    </li>
  );
}

function CompletedCard({ shift }: { shift: CuidadoraShift }) {
  return (
    <li className="card opacity-90">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold capitalize text-marino-800">{fmtDateLong(shift.start)}</p>
          <p className="text-sm text-marino-600">
            {fmtRange(shift.start, shift.end)} · {shift.durationHours} h · {shift.zone}
          </p>
          {shift.recipientName && (
            <p className="text-sm text-marino-500">{shift.recipientName}</p>
          )}
        </div>
        <StatusBadge status="COMPLETADO" />
      </div>
      <p className="mt-2 text-sm">
        <span className="font-semibold text-marino-500">Tu tarifa: </span>
        <span className="font-bold text-marino-700">
          {formatHourlyRange(shift.rateMinCents, shift.rateMaxCents)}
        </span>
      </p>
    </li>
  );
}
