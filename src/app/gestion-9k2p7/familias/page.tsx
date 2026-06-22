"use client";

import Link from "next/link";
import { usePolling } from "@/components/usePolling";
import { Loading, ErrorCard, EmptyCard } from "../_components/ui";
import type { FamilyAdmin } from "../_components/types";

function StatusBadge({ status }: { status: FamilyAdmin["subscriptionStatus"] }) {
  if (status === "ACTIVE") return <span className="badge bg-salvia-100 text-salvia-700">Cuota al día</span>;
  if (status === "PAST_DUE") return <span className="badge bg-calido-100 text-calido-700">Impagada</span>;
  return <span className="badge bg-gray-200 text-gray-600">Sin suscripción</span>;
}

export default function FamiliasPage() {
  const { data, error, loading } = usePolling<FamilyAdmin[]>("/api/admin/families", 10000);

  const list = data ?? [];
  const conCuota = list.filter((f) => f.subscriptionStatus === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-marino-800">Familias 👨‍👩‍👧</h1>
          <p className="mt-1 text-marino-500">Revisa y gestiona las cuentas de familias.</p>
        </div>
        {data && (
          <span className="hidden text-xs font-semibold text-salvia-600 sm:inline">
            {list.length} en total · {conCuota} con cuota al día
          </span>
        )}
      </div>

      {loading && !data ? (
        <Loading label="Cargando familias…" />
      ) : error && !data ? (
        <ErrorCard message={error} />
      ) : data ? (
        list.length === 0 ? (
          <EmptyCard>Todavía no hay familias registradas.</EmptyCard>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {list.map((f) => (
              <li key={f.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/gestion-9k2p7/familias/${f.id}`}
                      className="font-bold text-marino-800 hover:text-calido-700 hover:underline"
                    >
                      {f.name}
                    </Link>
                    <p className="truncate text-sm text-marino-500">{f.email}</p>
                    {f.phone && <p className="text-sm text-marino-500">📞 {f.phone}</p>}
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={f.subscriptionStatus} />
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-marino-500">
                  <span className="font-semibold text-marino-700">
                    {f.recipientsCount} persona(s) a cuidar
                  </span>
                  <span>{f.shiftsCount} turnos</span>
                  {f.planName && <span>· {f.planName}</span>}
                </div>

                <div className="mt-3">
                  <Link
                    href={`/gestion-9k2p7/familias/${f.id}`}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Ver ficha
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
