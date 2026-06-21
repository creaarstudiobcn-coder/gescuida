"use client";

import { useState } from "react";
import { usePolling } from "@/components/usePolling";
import { ZONAS_COBERTURA } from "@/lib/pricing";
import { Loading, ErrorCard, EmptyCard } from "../_components/Feedback";
import type { Recipient } from "../_components/types";

export default function PersonasPage() {
  const { data, error, loading, refresh } = usePolling<Recipient[]>(
    "/api/familia/recipients",
    15000
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Personas a cuidar</h1>
        <p className="mt-1 text-marino-500">
          Da de alta a quienes recibirán el cuidado para poder reservar visitas.
        </p>
      </div>

      <section className="space-y-3">
        {loading && !data ? (
          <Loading label="Cargando personas…" />
        ) : error && !data ? (
          <ErrorCard message={error} />
        ) : data && data.length > 0 ? (
          <ul className="space-y-3">
            {data.map((r) => (
              <li key={r.id} className="card">
                <p className="text-lg font-bold text-marino-800">{r.name}</p>
                <p className="text-sm text-marino-500">
                  {r.age != null ? `${r.age} años · ` : ""}
                  {r.zone}
                </p>
                {r.needs && (
                  <p className="mt-2 text-sm text-marino-600">
                    <span className="font-semibold">Necesidades:</span> {r.needs}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyCard title="Todavía no has añadido a nadie">
            Usa el formulario de abajo para dar de alta a la primera persona.
          </EmptyCard>
        )}
      </section>

      <NuevaPersonaForm onCreated={refresh} />
    </div>
  );
}

function NuevaPersonaForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [zone, setZone] = useState("");
  const [address, setAddress] = useState("");
  const [needs, setNeeds] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || !zone) {
      setFormError("El nombre y la zona son obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/familia/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: age ? Number(age) : undefined,
          zone,
          address: address.trim() || undefined,
          needs: needs.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Error ${res.status}`);
      }
      setName("");
      setAge("");
      setZone("");
      setAddress("");
      setNeeds("");
      setNotes("");
      onCreated();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-lg font-bold text-marino-800">Añadir una persona</h2>
        <p className="mt-1 text-sm text-marino-500">
          🔒 La dirección y los datos de salud se guardan cifrados y solo se revelan a la
          cuidadora que acepte el turno.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="p-name" className="label">
            Nombre y apellidos *
          </label>
          <input
            id="p-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="p-age" className="label">
              Edad
            </label>
            <input
              id="p-age"
              type="number"
              min={0}
              max={120}
              className="input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="p-zone" className="label">
              Zona *
            </label>
            <select
              id="p-zone"
              className="input"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              required
            >
              <option value="">Selecciona…</option>
              {ZONAS_COBERTURA.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="p-address" className="label">
            Dirección
          </label>
          <input
            id="p-address"
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, número, piso…"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="p-needs" className="label">
            Necesidades de cuidado
          </label>
          <textarea
            id="p-needs"
            className="input min-h-20"
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            placeholder="Movilidad, medicación, compañía, comidas…"
          />
        </div>

        <div>
          <label htmlFor="p-notes" className="label">
            Notas para la cuidadora
          </label>
          <textarea
            id="p-notes"
            className="input min-h-20"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cualquier detalle útil (alergias, rutinas, contacto…)"
          />
        </div>

        {formError && (
          <p className="rounded-xl bg-calido-50 px-4 py-2 text-sm font-semibold text-calido-700" role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar persona"}
        </button>
      </form>
    </section>
  );
}
