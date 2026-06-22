"use client";

import { useState } from "react";
import Link from "next/link";
import { usePolling } from "@/components/usePolling";
import { ChatThread } from "@/components/ChatThread";
import { formatHourlyRange } from "@/lib/pricing";
import { fmtDate } from "@/lib/format";
import { Loading, ErrorCard } from "./ui";
import type { CaregiverDetail as Detail } from "./types";

type Action = "VERIFY" | "UNVERIFY" | "SUSPEND" | "UNSUSPEND";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-crema-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-marino-400">{label}</dt>
      <dd className="mt-0.5 text-marino-800">{children}</dd>
    </div>
  );
}

// Disponibilidad guardada como JSON { lun: ["09:00-13:00"], ... }. La mostramos legible.
function Availability({ value }: { value: unknown }) {
  if (!value || typeof value !== "object") return <span className="text-marino-400">No indicada</span>;
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => Array.isArray(v) && v.length > 0
  );
  if (entries.length === 0) return <span className="text-marino-400">No indicada</span>;
  return (
    <ul className="space-y-0.5">
      {entries.map(([day, ranges]) => (
        <li key={day} className="capitalize">
          <span className="font-semibold">{day}:</span> {(ranges as string[]).join(", ")}
        </li>
      ))}
    </ul>
  );
}

export function CaregiverDetail({ id }: { id: string }) {
  const { data, error, loading, refresh } = usePolling<Detail>(
    `/api/admin/caregivers/${id}`,
    15000
  );
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function doAction(action: Action) {
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/caregivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caregiverUserId: id, action }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(b?.error ?? `Error ${res.status}`);
      }
      await refresh();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) return <Loading label="Cargando ficha…" />;
  if (error && !data) return <ErrorCard message={error} />;
  if (!data) return null;

  const c = data;

  return (
    <div className="space-y-6">
      <Link href="/gestion-9k2p7/cuidadoras" className="text-sm font-semibold text-calido-700 hover:underline">
        ← Volver a cuidadoras
      </Link>

      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {c.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.photoUrl} alt={c.name} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-salvia-100 text-2xl">
              🙂
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-marino-800">{c.name}</h1>
            <p className="text-sm text-marino-500">Alta: {fmtDate(c.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {c.verified ? (
            <span className="badge bg-salvia-100 text-salvia-700">✓ Verificada</span>
          ) : (
            <span className="badge bg-calido-100 text-calido-700">Por verificar</span>
          )}
          {c.suspended && <span className="badge bg-gray-200 text-gray-600">Suspendida</span>}
        </div>
      </div>

      {actionError && (
        <div className="card border-calido-300 bg-calido-50 text-calido-700" role="alert">
          {actionError}
        </div>
      )}

      {/* Ficha completa */}
      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="Email">
          <a href={`mailto:${c.email}`} className="text-calido-700 hover:underline">
            {c.email}
          </a>
        </Field>
        <Field label="Teléfono">
          {c.phone ? (
            <a href={`tel:${c.phone}`} className="text-calido-700 hover:underline">
              {c.phone}
            </a>
          ) : (
            <span className="text-marino-400">No indicado</span>
          )}
        </Field>
        <Field label="Tarifa por hora">
          {formatHourlyRange(c.hourlyRateMinCents, c.hourlyRateMaxCents)}
        </Field>
        <Field label="Turnos realizados">{c.shiftsCount}</Field>
        <Field label="Municipios">
          {c.zones.length > 0 ? c.zones.join(", ") : <span className="text-marino-400">Ninguno</span>}
        </Field>
        {c.otraZona && (
          <Field label="Otra provincia">
            <span className="text-calido-700">{c.otraZona}</span>
          </Field>
        )}
        <Field label="Verificada el">
          {c.verifiedAt ? fmtDate(c.verifiedAt) : <span className="text-marino-400">—</span>}
        </Field>
        <div className="sm:col-span-2">
          <Field label="Disponibilidad">
            <Availability value={c.availability} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Formación">
            {c.training || <span className="text-marino-400">No indicada</span>}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Presentación">
            {c.bio || <span className="text-marino-400">No indicada</span>}
          </Field>
        </div>
      </dl>

      {/* Acciones de verificación / suspensión */}
      <div className="flex flex-wrap gap-2">
        {c.verified ? (
          <button type="button" disabled={busy} onClick={() => doAction("UNVERIFY")} className="btn-ghost px-4 py-2 text-sm disabled:opacity-50">
            Quitar verificación
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={() => doAction("VERIFY")} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
            ✓ Verificar
          </button>
        )}
        {c.suspended ? (
          <button type="button" disabled={busy} onClick={() => doAction("UNSUSPEND")} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">
            Reactivar
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={() => doAction("SUSPEND")} className="btn-ghost px-4 py-2 text-sm text-calido-700 disabled:opacity-50">
            Suspender
          </button>
        )}
        {busy && <span className="self-center text-sm text-marino-400">Guardando…</span>}
      </div>

      {/* Chat directo admin ↔ cuidadora */}
      <div>
        <h2 className="mb-2 text-lg font-bold text-marino-800">💬 Chat con {c.name}</h2>
        <p className="mb-3 text-sm text-marino-500">
          Cuando le escribas, recibirá un aviso por email y podrá responderte desde su panel
          (pestaña «Mensajes»).
        </p>
        <ChatThread withUserId={c.id} />
      </div>
    </div>
  );
}
