"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePolling } from "@/components/usePolling";
import { ACCESS_PLANS, formatEuros, type AccessPlanKey } from "@/lib/pricing";
import { Loading, ErrorCard } from "../_components/Feedback";
import type { Access } from "../_components/types";

export default function SuscripcionPage() {
  return (
    <Suspense fallback={<Loading label="Cargando…" />}>
      <SuscripcionContent />
    </Suspense>
  );
}

function SuscripcionContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const access = usePolling<Access>("/api/familia/access", 15000);

  const [pendingKey, setPendingKey] = useState<AccessPlanKey | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const active = access.data?.subscriptionActive ?? false;
  const pastDue = access.data?.status === "PAST_DUE";
  const currentKey = access.data?.planKey ?? null;

  async function subscribe(planKey: AccessPlanKey) {
    setCheckoutError(null);
    setPendingKey(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.error) {
        throw new Error(j.error ?? `Error ${res.status}`);
      }
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      throw new Error("No se ha recibido el enlace de pago.");
    } catch (err) {
      setCheckoutError((err as Error).message);
      setPendingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Tu plan de acceso</h1>
        <p className="mt-1 text-marino-500">
          Elige cuántas cuidadoras distintas quieres poder contactar cada mes.
        </p>
      </div>

      {status === "success" && (
        <div className="card border-salvia-300 bg-salvia-50" role="status">
          <p className="font-semibold text-salvia-800">¡Listo! 🎉</p>
          <p className="mt-1 text-sm text-marino-600">
            Tu plan está activo. Ya puedes buscar cuidadoras y reservar visitas.
          </p>
        </div>
      )}
      {status === "cancel" && (
        <div className="card border-calido-300 bg-calido-50" role="status">
          <p className="font-semibold text-calido-800">Pago cancelado</p>
          <p className="mt-1 text-sm text-marino-600">
            No se ha realizado ningún cargo. Puedes intentarlo de nuevo cuando quieras.
          </p>
        </div>
      )}

      {access.loading && !access.data ? (
        <Loading label="Cargando tu plan…" />
      ) : access.error && !access.data ? (
        <ErrorCard message={access.error} />
      ) : (
        <div className="card bg-marino-50">
          <p className="text-sm font-semibold text-marino-500">Estado actual</p>
          {active ? (
            <p className="mt-1 text-lg font-bold text-marino-800">
              {access.data?.planName} · <span className="text-salvia-700">activo</span>
              {access.data?.contacts && (
                <span className="ml-2 text-sm font-semibold text-marino-500">
                  ({access.data.contacts.used}/{access.data.contacts.limit} contactos este mes)
                </span>
              )}
            </p>
          ) : pastDue ? (
            <p className="mt-1 text-lg font-bold text-calido-700">Cuota pendiente de pago</p>
          ) : (
            <p className="mt-1 text-lg font-bold text-marino-800">Sin plan activo</p>
          )}
        </div>
      )}

      {checkoutError && (
        <div className="card border-calido-300 bg-calido-50" role="alert">
          <p className="font-semibold text-calido-800">No se ha podido iniciar el pago</p>
          <p className="mt-1 text-sm text-marino-600">{checkoutError}</p>
        </div>
      )}

      {/* Dos planes de acceso */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.values(ACCESS_PLANS)).map((plan) => {
          const isCurrent = active && currentKey === plan.key;
          const destacado = plan.key === "COMPLETO";
          return (
            <div
              key={plan.key}
              className={`card flex flex-col ${
                isCurrent
                  ? "border-salvia-400 ring-2 ring-salvia-200"
                  : destacado
                    ? "border-calido-300 ring-2 ring-calido-100"
                    : ""
              }`}
            >
              {destacado && !isCurrent && (
                <span className="badge mb-2 self-start bg-calido-100 text-calido-700">
                  Recomendado
                </span>
              )}
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-xl font-bold text-marino-800">{plan.name}</h2>
                <p className="text-right">
                  <span className="text-2xl font-extrabold text-calido-600">
                    {formatEuros(plan.priceCents)}
                  </span>
                  <span className="block text-xs text-marino-500">al mes</span>
                </p>
              </div>
              <p className="mt-2 text-sm font-semibold text-salvia-700">
                Hasta {plan.contactLimit} cuidadoras distintas al mes
              </p>
              <ul className="mt-2 flex-1 space-y-1 text-sm text-marino-600">
                <li>✓ Reservar y coordinar visitas, sin límite de horas</li>
                <li>✓ Mensajería con las cuidadoras que contactes</li>
                <li>✓ Seguimiento en tiempo real</li>
              </ul>

              <button
                type="button"
                className="btn-primary mt-4 w-full"
                onClick={() => subscribe(plan.key)}
                disabled={pendingKey !== null || isCurrent}
              >
                {isCurrent
                  ? "Tu plan actual"
                  : pendingKey === plan.key
                    ? "Redirigiendo…"
                    : active
                      ? plan.key === "COMPLETO"
                        ? "Subir a este plan"
                        : "Cambiar a este plan"
                      : "Elegir este plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Aviso legal: qué es y qué NO es esta cuota */}
      <div className="card border-marino-200 bg-marino-50 text-sm text-marino-700">
        <p className="font-bold text-marino-800">Importante: qué pagas con esta cuota</p>
        <p className="mt-2">
          La cuota mensual es por el <strong>uso de la plataforma de conexión</strong>, no por el
          servicio de cuidado. GesCuida pone en contacto a familias y cuidadoras;{" "}
          <strong>no emplea a las cuidadoras ni presta el cuidado directamente</strong>.
        </p>
        <p className="mt-2">
          El <strong>importe del cuidado se acuerda y se abona directamente</strong> entre familia
          y cuidadora. <strong>Cada cuidadora fija su propia tarifa por hora</strong> (la verás en su
          perfil al quedar asignada). La plataforma no fija ni cobra ese importe.
        </p>
      </div>
    </div>
  );
}
