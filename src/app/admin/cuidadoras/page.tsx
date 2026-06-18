"use client";

import { useState } from "react";
import { usePolling } from "@/components/usePolling";
import { Loading, ErrorCard, EmptyCard } from "../_components/ui";
import type { CaregiverAdmin } from "../_components/types";

type Action = "VERIFY" | "UNVERIFY" | "SUSPEND" | "UNSUSPEND";

export default function CuidadorasPage() {
  const { data, error, loading, refresh } = usePolling<CaregiverAdmin[]>(
    "/api/admin/caregivers",
    10000
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function doAction(caregiverUserId: string, action: Action) {
    setBusyId(caregiverUserId);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/caregivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caregiverUserId, action }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Error ${res.status}`);
      }
      await refresh();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const list = data ?? [];
  const pendientes = list.filter((c) => !c.verified && !c.suspended);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-marino-800">Cuidadoras 🤝</h1>
          <p className="mt-1 text-marino-500">Verifica, suspende y revisa el equipo.</p>
        </div>
        {data && (
          <span className="hidden text-xs font-semibold text-salvia-600 sm:inline">
            {list.length} en total · {pendientes.length} por verificar
          </span>
        )}
      </div>

      {actionError && (
        <div className="card border-calido-300 bg-calido-50 text-calido-700" role="alert">
          {actionError}
        </div>
      )}

      {loading && !data ? (
        <Loading label="Cargando cuidadoras…" />
      ) : error && !data ? (
        <ErrorCard message={error} />
      ) : data ? (
        list.length === 0 ? (
          <EmptyCard>Todavía no hay cuidadoras registradas.</EmptyCard>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {list.map((c) => (
              <CaregiverCard
                key={c.id}
                c={c}
                busy={busyId === c.id}
                onAction={doAction}
              />
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}

function CaregiverCard({
  c,
  busy,
  onAction,
}: {
  c: CaregiverAdmin;
  busy: boolean;
  onAction: (id: string, action: Action) => void;
}) {
  const pendiente = !c.verified && !c.suspended;

  return (
    <li
      className={`card ${pendiente ? "border-calido-300 bg-calido-50" : c.suspended ? "border-gray-200 bg-gray-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-marino-800">{c.name}</p>
          <p className="truncate text-sm text-marino-500">{c.email}</p>
          {c.phone && <p className="text-sm text-marino-500">📞 {c.phone}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {c.verified ? (
            <span className="badge bg-salvia-100 text-salvia-700">✓ Verificada</span>
          ) : (
            <span className="badge bg-calido-100 text-calido-700">Por verificar</span>
          )}
          {c.suspended && <span className="badge bg-gray-200 text-gray-600">Suspendida</span>}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-marino-500">
        <span className="font-semibold text-marino-700">{c.shiftsCount} turnos</span>
        {c.zones.length > 0 ? (
          <span>📍 {c.zones.join(", ")}</span>
        ) : (
          <span className="text-marino-400">Sin municipios asignados</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {c.verified ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction(c.id, "UNVERIFY")}
            className="btn-ghost px-4 py-2 text-sm disabled:opacity-50"
          >
            Quitar verificación
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction(c.id, "VERIFY")}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            ✓ Verificar
          </button>
        )}
        {c.suspended ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction(c.id, "UNSUSPEND")}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
          >
            Reactivar
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction(c.id, "SUSPEND")}
            className="btn-ghost px-4 py-2 text-sm text-calido-700 disabled:opacity-50"
          >
            Suspender
          </button>
        )}
        {busy && <span className="self-center text-sm text-marino-400">Guardando…</span>}
      </div>
    </li>
  );
}
