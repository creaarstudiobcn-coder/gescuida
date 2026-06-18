"use client";

import { useCallback, useEffect, useState } from "react";
import type { CaregiverAdmin } from "./types";

// Botón + modal de asignación manual de un turno.
// Carga las cuidadoras (verificadas y no suspendidas primero) y permite asignar.
export function AssignButton({
  shiftId,
  reassign = false,
  onAssigned,
}: {
  shiftId: string;
  reassign?: boolean;
  onAssigned?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={reassign ? "btn-ghost px-4 py-2 text-sm" : "btn-primary px-4 py-2 text-sm"}
      >
        {reassign ? "🔁 Reasignar" : "👤 Asignar manualmente"}
      </button>
      {open && (
        <AssignModal
          shiftId={shiftId}
          onClose={() => setOpen(false)}
          onAssigned={() => {
            onAssigned?.();
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function AssignModal({
  shiftId,
  onClose,
  onAssigned,
}: {
  shiftId: string;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [caregivers, setCaregivers] = useState<CaregiverAdmin[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/caregivers", { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const list = (await res.json()) as CaregiverAdmin[];
      // Orden: verificadas y no suspendidas primero, suspendidas al final.
      list.sort((a, b) => {
        const score = (c: CaregiverAdmin) =>
          (c.suspended ? 2 : 0) + (c.verified ? 0 : 1);
        return score(a) - score(b);
      });
      setCaregivers(list);
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Cerrar con Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function assign(caregiverUserId: string) {
    setAssigningId(caregiverUserId);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/shifts/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId, caregiverUserId }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Error ${res.status}`);
      }
      onAssigned();
    } catch (e) {
      setActionError((e as Error).message);
      setAssigningId(null);
    }
  }

  const filtered = (caregivers ?? []).filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.zones.some((z) => z.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-marino-900/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Asignar cuidadora al turno"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-marino-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-marino-800">Asignar cuidadora</h2>
            <p className="text-sm text-marino-500">Cubre o reasigna este turno manualmente.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-3 py-1 text-sm"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-marino-100 px-5 py-3">
          <input
            type="search"
            className="input"
            placeholder="Buscar por nombre, email o municipio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar cuidadora"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loadError ? (
            <div className="card border-calido-300 bg-calido-50 text-calido-700" role="alert">
              <p className="font-semibold">No se pudo cargar la lista</p>
              <p className="mt-1 text-sm">{loadError}</p>
              <button type="button" onClick={load} className="btn-secondary mt-3 px-4 py-2 text-sm">
                Reintentar
              </button>
            </div>
          ) : caregivers === null ? (
            <p className="text-marino-500">Cargando cuidadoras…</p>
          ) : filtered.length === 0 ? (
            <p className="text-marino-500">No hay cuidadoras que coincidan.</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((c) => {
                const disabled = c.suspended || assigningId !== null;
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-marino-100 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-marino-800">{c.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                        {c.verified ? (
                          <span className="badge bg-salvia-100 text-salvia-700">Verificada</span>
                        ) : (
                          <span className="badge bg-calido-100 text-calido-700">Sin verificar</span>
                        )}
                        {c.suspended && (
                          <span className="badge bg-gray-200 text-gray-600">Suspendida</span>
                        )}
                        <span className="text-marino-400">{c.shiftsCount} turnos</span>
                      </div>
                      {c.zones.length > 0 && (
                        <p className="mt-0.5 truncate text-xs text-marino-400">
                          {c.zones.join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => assign(c.id)}
                      disabled={disabled}
                      className="btn-secondary shrink-0 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {assigningId === c.id ? "Asignando…" : "Asignar"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {actionError && (
            <p className="mt-3 text-sm font-semibold text-calido-700" role="alert">
              {actionError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
