"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePolling } from "@/components/usePolling";
import { fmtDate } from "@/lib/format";
import { Loading, ErrorCard } from "./ui";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import type { FamilyDetail as Detail, FamilyRecipient } from "./types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-crema-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-marino-400">{label}</dt>
      <dd className="mt-0.5 text-marino-800">{children}</dd>
    </div>
  );
}

function SubscriptionBadge({ status }: { status: Detail["subscriptionStatus"] }) {
  if (status === "ACTIVE") return <span className="badge bg-salvia-100 text-salvia-700">Cuota al día</span>;
  if (status === "PAST_DUE") return <span className="badge bg-calido-100 text-calido-700">Impagada</span>;
  return <span className="badge bg-gray-200 text-gray-600">Sin suscripción</span>;
}

function RecipientCard({ r }: { r: FamilyRecipient }) {
  return (
    <div className="rounded-xl border border-marino-100 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-marino-800">{r.name}</p>
          <p className="text-sm text-marino-500">
            {r.age != null ? `${r.age} años · ` : ""}📍 {r.zone}
          </p>
        </div>
        <span className="badge bg-crema-100 text-marino-600">{r.shiftsCount} turnos</span>
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div>
          <dt className="font-semibold text-marino-600">Dirección</dt>
          <dd className="text-marino-700">{r.address || <span className="text-marino-400">No indicada</span>}</dd>
        </div>
        <div>
          <dt className="font-semibold text-marino-600">Necesidades / salud</dt>
          <dd className="whitespace-pre-wrap text-marino-700">
            {r.needs || <span className="text-marino-400">No indicadas</span>}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-marino-600">Notas</dt>
          <dd className="whitespace-pre-wrap text-marino-700">
            {r.notes || <span className="text-marino-400">Ninguna</span>}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function FamilyDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data, error, loading } = usePolling<Detail>(`/api/admin/families/${id}`, 15000);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function doDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/families/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(b?.error ?? `Error ${res.status}`);
      }
      router.push("/gestion-9k2p7/familias");
      router.refresh();
    } catch (e) {
      setDeleteError((e as Error).message);
      setDeleting(false);
    }
  }

  if (loading && !data) return <Loading label="Cargando ficha…" />;
  if (error && !data) return <ErrorCard message={error} />;
  if (!data) return null;

  const f = data;

  return (
    <div className="space-y-6">
      <Link href="/gestion-9k2p7/familias" className="text-sm font-semibold text-calido-700 hover:underline">
        ← Volver a familias
      </Link>

      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-marino-800">{f.name}</h1>
          <p className="text-sm text-marino-500">Alta: {fmtDate(f.createdAt)}</p>
        </div>
        <SubscriptionBadge status={f.subscriptionStatus} />
      </div>

      {/* Datos */}
      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="Email">
          <a href={`mailto:${f.email}`} className="text-calido-700 hover:underline">
            {f.email}
          </a>
        </Field>
        <Field label="Teléfono">
          {f.phone ? (
            <a href={`tel:${f.phone}`} className="text-calido-700 hover:underline">
              {f.phone}
            </a>
          ) : (
            <span className="text-marino-400">No indicado</span>
          )}
        </Field>
        <Field label="Plan">
          {f.planName ?? <span className="text-marino-400">Sin plan</span>}
        </Field>
        <Field label="Contactos usados">
          {f.contactLimit > 0 ? `${f.contactsUsed} / ${f.contactLimit}` : f.contactsUsed}
        </Field>
        <Field label="Renovación">
          {f.periodEnd ? fmtDate(f.periodEnd) : <span className="text-marino-400">—</span>}
        </Field>
        <Field label="Turnos / Pagos">
          {f.shiftsCount} turnos · {f.paymentsCount} pagos
        </Field>
      </dl>

      {/* Personas a cuidar */}
      <div>
        <h2 className="mb-2 text-lg font-bold text-marino-800">
          Personas a cuidar ({f.recipients.length})
        </h2>
        {f.recipients.length === 0 ? (
          <div className="card border-dashed text-center text-sm text-marino-500">
            Esta familia no tiene personas a cuidar registradas.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {f.recipients.map((r) => (
              <RecipientCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>

      {/* Zona de peligro: borrado permanente */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <div className="text-sm text-marino-600">
          <p className="font-semibold text-red-700">Eliminar familia</p>
          <p>
            Borra la cuenta y todos sus datos.
            {f.hasStripeSubscription
              ? " Su suscripción se cancelará en Stripe antes de borrar."
              : ""}{" "}
            Permanente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setConfirmOpen(true);
          }}
          className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        title="Eliminar familia"
        message={
          <>
            <p>
              Vas a eliminar permanentemente a <strong>{f.name}</strong> ({f.email}). Esta acción es{" "}
              <strong>irreversible</strong>.
            </p>
            <p>
              Se borrarán en cascada: sus <strong>{f.recipients.length} persona(s) a cuidar</strong>,
              sus turnos, pagos, suscripciones y mensajes.
            </p>
            {f.hasStripeSubscription && (
              <p className="font-semibold text-red-700">
                Su suscripción activa se cancelará en Stripe antes de borrar. Si la cancelación falla,
                no se borrará nada.
              </p>
            )}
          </>
        }
        confirmWord={f.name}
        busy={deleting}
        error={deleteError}
        onConfirm={doDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
