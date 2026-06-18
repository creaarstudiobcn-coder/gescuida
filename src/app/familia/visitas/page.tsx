"use client";

import { useState } from "react";
import Link from "next/link";
import { usePolling } from "@/components/usePolling";
import { StatusBadge } from "@/components/StatusBadge";
import { ChatThread } from "@/components/ChatThread";
import { fmtDate, fmtRange } from "@/lib/format";
import { formatHourlyRange } from "@/lib/pricing";
import { Loading, ErrorCard, EmptyCard } from "../_components/Feedback";
import type { Shift } from "../_components/types";

export default function VisitasPage() {
  const { data, error, loading, refresh } = usePolling<Shift[]>("/api/familia/shifts", 5000);

  const sorted = (data ?? [])
    .slice()
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-marino-800">Mis visitas</h1>
          <p className="mt-1 text-marino-500">Se actualiza en tiempo real.</p>
        </div>
        <Link href="/familia/reservar" className="btn-primary px-4 py-2 text-sm">
          Reservar
        </Link>
      </div>

      {loading && !data ? (
        <Loading label="Cargando visitas…" />
      ) : error && !data ? (
        <ErrorCard message={error} />
      ) : sorted.length === 0 ? (
        <EmptyCard title="Aún no tienes visitas">
          Cuando reserves una, la verás aquí con su estado actualizado.
        </EmptyCard>
      ) : (
        <ul className="space-y-3">
          {sorted.map((s) => (
            <VisitaCard key={s.id} shift={s} onChanged={refresh} />
          ))}
        </ul>
      )}
    </div>
  );
}

function VisitaCard({ shift, onChanged }: { shift: Shift; onChanged: () => void }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const pending = shift.status === "PENDIENTE";
  const cancelable = shift.status === "PENDIENTE" || shift.status === "CONFIRMADO";

  async function cancel() {
    if (!confirm("¿Seguro que quieres cancelar esta visita?")) return;
    setActionError(null);
    setCancelling(true);
    try {
      const res = await fetch("/api/shifts/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId: shift.id, action: "CANCEL" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Error ${res.status}`);
      }
      onChanged();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <li className={`card ${pending ? "border-calido-300 bg-calido-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-marino-800">{fmtDate(shift.start)}</p>
          <p className="text-marino-600">
            {fmtRange(shift.start, shift.end)} · {shift.durationHours} h
          </p>
          <p className="mt-1 text-sm text-marino-500">
            {shift.recipientName ? `👵 ${shift.recipientName} · ` : ""}
            {shift.zone}
          </p>
        </div>
        <StatusBadge status={shift.status} />
      </div>

      {shift.careSummary && (
        <p className="mt-2 text-sm text-marino-600">{shift.careSummary}</p>
      )}

      {pending && (
        <p className="mt-2 text-sm font-semibold text-calido-700" aria-live="polite">
          Buscando cuidadora… te avisaremos al confirmar.
        </p>
      )}

      {shift.status === "CONFIRMADO" && shift.caregiver && (
        <div className="mt-2 rounded-xl bg-salvia-50 px-3 py-2 text-sm">
          <p className="font-semibold text-salvia-700">
            Cuidadora asignada: {shift.caregiver.name}
          </p>
          <p className="mt-0.5 text-marino-600">
            Tarifa de {shift.caregiver.name.split(" ")[0]}:{" "}
            <span className="font-semibold">
              {formatHourlyRange(shift.caregiver.rateMinCents, shift.caregiver.rateMaxCents)}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-marino-400">
            El importe del cuidado lo acordáis y abonáis directamente entre vosotras. La plataforma
            no fija ni cobra ese precio.
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {shift.status === "CONFIRMADO" && shift.caregiver && (
          <button
            type="button"
            className="btn-secondary px-4 py-2 text-sm"
            onClick={() => setChatOpen((o) => !o)}
            aria-expanded={chatOpen}
          >
            💬 {chatOpen ? "Ocultar mensajes" : "Mensajear"}
          </button>
        )}
        {cancelable && (
          <button
            type="button"
            className="btn-ghost px-4 py-2 text-sm text-calido-700 hover:bg-calido-100"
            onClick={cancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelando…" : "Cancelar"}
          </button>
        )}
      </div>

      {actionError && (
        <p className="mt-2 text-sm font-semibold text-calido-700" role="alert">
          {actionError}
        </p>
      )}

      {chatOpen && shift.status === "CONFIRMADO" && (
        <div className="mt-3">
          <ChatThread shiftId={shift.id} />
        </div>
      )}
    </li>
  );
}
