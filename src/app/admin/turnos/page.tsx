"use client";

import { useMemo, useState } from "react";
import { usePolling } from "@/components/usePolling";
import { ShiftCard } from "../_components/ShiftCard";
import { Loading, ErrorCard, EmptyCard } from "../_components/ui";
import type { OverviewData, ShiftAdmin } from "../_components/types";

type FilterKey = "TODOS" | "PENDIENTE" | "CONFIRMADO" | "COMPLETADO";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "TODOS", label: "Todos" },
  { key: "PENDIENTE", label: "Sin cubrir" },
  { key: "CONFIRMADO", label: "Cubiertos" },
  { key: "COMPLETADO", label: "Completados" },
];

// Bucket temporal de un turno según su fecha de inicio.
type Bucket = "today" | "week" | "later" | "past";

function bucketOf(startISO: string): Bucket {
  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);
  const tomorrow0 = new Date(today0);
  tomorrow0.setDate(today0.getDate() + 1);
  const weekEnd = new Date(today0);
  weekEnd.setDate(today0.getDate() + 7);

  const t = new Date(startISO).getTime();
  if (Number.isNaN(t)) return "later";
  if (t < today0.getTime()) return "past";
  if (t < tomorrow0.getTime()) return "today";
  if (t < weekEnd.getTime()) return "week";
  return "later";
}

const TIME_SECTIONS: { bucket: Bucket; title: string }[] = [
  { bucket: "today", title: "Hoy" },
  { bucket: "week", title: "Esta semana" },
  { bucket: "later", title: "Más adelante" },
  { bucket: "past", title: "Pasados" },
];

function matchesQuery(s: ShiftAdmin, q: string): boolean {
  if (!q) return true;
  const haystack = [s.recipientName ?? "", s.zone, s.caregiver?.name ?? ""]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export default function TurnosPage() {
  const { data, error, loading, refresh } = usePolling<OverviewData>("/api/admin/overview", 5000);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("TODOS");

  // Todos los turnos en un solo array (pending + confirmed + completed).
  const all = useMemo<ShiftAdmin[]>(
    () => (data ? [...data.pending, ...data.confirmed, ...data.completed] : []),
    [data]
  );

  // Filtrado por texto (persona, zona, cuidadora).
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((s) => matchesQuery(s, q));
  }, [all, query]);

  // Contadores por estado (sobre el conjunto ya buscado, para que sean coherentes).
  const counts = useMemo(
    () => ({
      TODOS: searched.length,
      PENDIENTE: searched.filter((s) => s.status === "PENDIENTE").length,
      CONFIRMADO: searched.filter((s) => s.status === "CONFIRMADO").length,
      COMPLETADO: searched.filter((s) => s.status === "COMPLETADO").length,
    }),
    [searched]
  );

  // Aplica el filtro de estado activo.
  const filtered = useMemo(
    () => (filter === "TODOS" ? searched : searched.filter((s) => s.status === filter)),
    [searched, filter]
  );

  // Sección destacada: los turnos sin cubrir, siempre arriba.
  const sinCubrir = useMemo(
    () =>
      filtered
        .filter((s) => s.status === "PENDIENTE")
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [filtered]
  );

  // Resto (cubiertos / completados) agrupado por tiempo.
  const porTiempo = useMemo(() => {
    const groups: Record<Bucket, ShiftAdmin[]> = { today: [], week: [], later: [], past: [] };
    for (const s of filtered) {
      if (s.status === "PENDIENTE") continue; // van a "Necesitan tu atención"
      groups[bucketOf(s.start)].push(s);
    }
    for (const b of Object.keys(groups) as Bucket[]) {
      groups[b].sort((a, c) => new Date(a.start).getTime() - new Date(c.start).getTime());
    }
    return groups;
  }, [filtered]);

  const hayResultados =
    sinCubrir.length > 0 || TIME_SECTIONS.some((t) => porTiempo[t.bucket].length > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-marino-800">Tablero de turnos 🗂️</h1>
          <p className="mt-1 text-marino-500">Busca, filtra y resuelve, en tiempo real.</p>
        </div>
        <span className="hidden text-xs font-semibold text-salvia-600 sm:inline">
          🔄 Actualiza cada 5 s
        </span>
      </div>

      {/* Buscador + filtros rápidos (sticky para tenerlos siempre a mano) */}
      <div className="sticky top-14 z-20 space-y-3 rounded-2xl border border-marino-100 bg-crema-50/95 p-3 backdrop-blur">
        <input
          type="search"
          className="input"
          placeholder="Buscar por persona, zona o cuidadora…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar turnos"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "border-calido-500 bg-calido-500 text-white"
                    : "border-marino-200 bg-white text-marino-600 hover:border-marino-300"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    active ? "bg-white/25 text-white" : "bg-marino-100 text-marino-600"
                  }`}
                >
                  {counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading && !data ? (
        <Loading label="Cargando turnos…" />
      ) : error && !data ? (
        <ErrorCard message={error} />
      ) : !data ? null : !hayResultados ? (
        <EmptyCard>
          {query || filter !== "TODOS"
            ? "No hay turnos que coincidan con tu búsqueda o filtro."
            : "No hay turnos todavía."}
        </EmptyCard>
      ) : (
        <div className="space-y-6">
          {/* Necesitan tu atención — siempre arriba, destacado */}
          {sinCubrir.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-calido-700">⚠️ Necesitan tu atención</h2>
                <span className="badge bg-calido-100 text-calido-700">{sinCubrir.length}</span>
              </div>
              <p className="text-sm text-marino-500">
                Turnos sin cuidadora. Asígnalas para cubrirlos.
              </p>
              <ul className="grid gap-3 lg:grid-cols-2">
                {sinCubrir.map((s) => (
                  <li key={s.id}>
                    <ShiftCard shift={s} onAssigned={refresh} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Secciones por tiempo (cubiertos / completados) */}
          {TIME_SECTIONS.map((t) => {
            const items = porTiempo[t.bucket];
            if (items.length === 0) return null;
            return (
              <section key={t.bucket} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-marino-800">{t.title}</h2>
                  <span className="badge bg-marino-100 text-marino-700">{items.length}</span>
                </div>
                <ul className="grid gap-3 lg:grid-cols-2">
                  {items.map((s) => (
                    <li key={s.id}>
                      <ShiftCard shift={s} onAssigned={refresh} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
