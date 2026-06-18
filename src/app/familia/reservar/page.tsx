"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePolling } from "@/components/usePolling";
import { Loading, ErrorCard } from "../_components/Feedback";
import type { Recipient, Access } from "../_components/types";

const DURATIONS = [1, 2, 3, 4, 6, 8];

function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

interface BlockedError {
  code: "NO_SUBSCRIPTION";
  message: string;
}

export default function ReservarPage() {
  const router = useRouter();
  const recipients = usePolling<Recipient[]>("/api/familia/recipients", 30000);
  const access = usePolling<Access>("/api/familia/access", 15000);

  const [recipientId, setRecipientId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(2);
  const [careSummary, setCareSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<BlockedError | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setBlocked(null);
    if (!recipientId) {
      setFormError("Selecciona a la persona que recibirá el cuidado.");
      return;
    }
    if (!date || !time) {
      setFormError("Indica la fecha y la hora de inicio.");
      return;
    }
    const start = new Date(`${date}T${time}:00`);
    if (Number.isNaN(start.getTime())) {
      setFormError("La fecha u hora no son válidas.");
      return;
    }
    if (start.getTime() < Date.now()) {
      setFormError("La visita debe ser en una fecha y hora futuras.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/familia/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careRecipientId: recipientId,
          start: start.toISOString(),
          durationHours: duration,
          careSummary: careSummary.trim() || undefined,
        }),
      });

      if (res.status === 402) {
        const j = await res.json().catch(() => ({}));
        setBlocked({
          code: "NO_SUBSCRIPTION",
          message: j.error ?? "Necesitas la cuota de acceso activa para reservar.",
        });
        return;
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Error ${res.status}`);
      }

      router.push("/familia/visitas");
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Reservar una visita</h1>
        <p className="mt-1 text-marino-500">
          La reserva quedará <span className="font-semibold">buscando cuidadora</span> hasta que
          una la acepte. Te avisaremos en cuanto esté confirmada.
        </p>
      </div>

      {recipients.loading && !recipients.data ? (
        <Loading label="Preparando el formulario…" />
      ) : recipients.error && !recipients.data ? (
        <ErrorCard message={recipients.error} />
      ) : recipients.data && recipients.data.length === 0 ? (
        <div className="card border-dashed text-center">
          <p className="font-semibold text-marino-700">
            Primero añade a la persona que recibirá el cuidado
          </p>
          <Link href="/familia/personas" className="btn-primary mt-4">
            👵 Ir a Personas
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label htmlFor="r-recipient" className="label">
              ¿Quién recibe el cuidado? *
            </label>
            <select
              id="r-recipient"
              className="input"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              required
            >
              <option value="">Selecciona…</option>
              {recipients.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.zone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="r-date" className="label">
                Fecha *
              </label>
              <input
                id="r-date"
                type="date"
                className="input"
                value={date}
                min={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="r-time" className="label">
                Hora de inicio *
              </label>
              <input
                id="r-time"
                type="time"
                className="input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="r-duration" className="label">
              Duración
            </label>
            <select
              id="r-duration"
              className="input"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {DURATIONS.map((h) => (
                <option key={h} value={h}>
                  {h} {h === 1 ? "hora" : "horas"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="r-summary" className="label">
              Resumen de la visita (opcional)
            </label>
            <textarea
              id="r-summary"
              className="input min-h-20"
              value={careSummary}
              onChange={(e) => setCareSummary(e.target.value)}
              placeholder="Qué se necesita en esta visita concreta"
            />
          </div>

          {/* Aviso: el precio del cuidado lo pone cada cuidadora, no la plataforma */}
          <div className="rounded-xl bg-salvia-50 p-4 text-sm">
            <p className="font-semibold text-marino-700">Sobre el precio del cuidado</p>
            <p className="mt-1 text-marino-600">
              Cada cuidadora fija su propia tarifa por hora. Verás la de la cuidadora concreta{" "}
              <span className="font-semibold">cuando acepte tu visita</span>, y el importe lo
              acordáis y abonáis <strong>directamente entre vosotras</strong>.
            </p>
            <p className="mt-2 text-xs text-marino-500">
              La plataforma <strong>no fija ni cobra</strong> el precio del cuidado. Tu cuota mensual
              cubre solo el acceso para buscar, reservar y coordinar.
            </p>
          </div>

          {blocked && (
            <div className="rounded-xl border border-calido-300 bg-calido-50 p-4" role="alert">
              <p className="font-semibold text-calido-800">{blocked.message}</p>
              <Link href="/familia/suscripcion" className="btn-primary mt-3">
                💳 Activar mi acceso
              </Link>
            </div>
          )}

          {formError && (
            <p className="rounded-xl bg-calido-50 px-4 py-2 text-sm font-semibold text-calido-700" role="alert">
              {formError}
            </p>
          )}

          {access.data && !access.data.subscriptionActive && !blocked && (
            <p className="rounded-xl bg-marino-50 px-4 py-2 text-sm text-marino-600">
              ℹ️ Para confirmar la reserva necesitas la cuota de acceso activa.
            </p>
          )}

          <button type="submit" className="btn-primary w-full text-lg" disabled={submitting}>
            {submitting ? "Enviando…" : "Buscar cuidadora"}
          </button>
        </form>
      )}
    </div>
  );
}
