"use client";

import { useCallback, useEffect, useState } from "react";
import { Loading, ErrorCard } from "../_components/ui";
import type { StripeDiagnostico, Hallazgo, PrecioDiag } from "@/lib/stripe-diagnostico";

// Comprobación de que la pasarela cobra de verdad. No se refresca sola: cada carga
// llama a la API de Stripe, así que se pide a mano con el botón.
export default function StripeDiagnosticoPage() {
  const [data, setData] = useState<StripeDiagnostico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stripe/diagnostico", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
      setData(json as StripeDiagnostico);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const criticos = data?.hallazgos.filter((h) => h.nivel === "critico") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-marino-800">Pasarela de pago 💳</h1>
          <p className="mt-1 text-marino-500">
            Comprueba que Stripe está en modo real y que un pago activaría el acceso.
          </p>
        </div>
        <button type="button" onClick={cargar} disabled={loading} className="btn-secondary">
          {loading ? "Comprobando…" : "🔄 Volver a comprobar"}
        </button>
      </div>

      {loading && !data ? (
        <Loading label="Preguntando a Stripe…" />
      ) : error && !data ? (
        <ErrorCard message={error} />
      ) : data ? (
        <>
          <div
            className={`card ${
              criticos.length > 0
                ? "border-calido-300 bg-calido-50 text-calido-700"
                : "border-salvia-300 bg-salvia-50 text-salvia-700"
            }`}
          >
            <p className="text-lg font-bold">
              {criticos.length > 0
                ? `${criticos.length} ${criticos.length === 1 ? "problema" : "problemas"} que impiden cobrar`
                : "Todo correcto: la web puede cobrar y activar el acceso"}
            </p>
            <p className="mt-1 text-sm">
              Clave <strong>{data.clave.modo}</strong> ·{" "}
              {data.cuenta ? `cuenta ${data.cuenta.nombre ?? data.cuenta.id}` : "cuenta no legible"} ·{" "}
              {data.entorno.appUrl}
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-marino-800">Qué dice la comprobación</h2>
            {data.hallazgos.map((h, i) => (
              <HallazgoFila key={i} h={h} />
            ))}
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-marino-800">Precios de los planes</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.precios.map((p) => (
                <PrecioCard key={p.plan} p={p} />
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-marino-800">Endpoints de webhook</h2>
            {!data.webhooksLegibles ? (
              <div className="card text-sm text-marino-500">
                No se han podido listar (mira el aviso de arriba).
              </div>
            ) : data.webhooks.length === 0 ? (
              <div className="card border-calido-300 bg-calido-50 text-sm text-calido-700">
                Esta cuenta no tiene ningún endpoint en este modo.
              </div>
            ) : (
              <ul className="space-y-2">
                {data.webhooks.map((w) => (
                  <li
                    key={w.url}
                    className={`card text-sm ${w.esDeEstaWeb ? "border-salvia-300" : "opacity-70"}`}
                  >
                    <p className="font-semibold break-all text-marino-800">
                      {w.esDeEstaWeb ? "➡️ " : ""}
                      {w.url}
                    </p>
                    <p className="mt-1 text-marino-500">
                      Estado: {w.estado} · API {w.apiVersion ?? "por defecto"} ·{" "}
                      {w.eventos.includes("*") ? "todos los eventos" : `${w.eventos.length} eventos`}
                    </p>
                    {w.faltan.length > 0 && (
                      <p className="mt-1 font-semibold text-calido-700">
                        Le faltan: {w.faltan.join(", ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-marino-500">
              El <code>whsec_</code> solo se ve al crear el endpoint, así que no se puede comprobar por
              API que el guardado en Vercel sea el de este endpoint: eso lo confirma el primer pago real.
            </p>
          </section>

          <p className="text-xs text-marino-400">
            Comprobado el {new Date(data.generadoEn).toLocaleString("es-ES")}. Ningún dato secreto sale
            del servidor.
          </p>
        </>
      ) : null}
    </div>
  );
}

function HallazgoFila({ h }: { h: Hallazgo }) {
  const estilo =
    h.nivel === "critico"
      ? "border-calido-300 bg-calido-50 text-calido-700"
      : h.nivel === "aviso"
        ? "border-marino-200 bg-white text-marino-700"
        : "border-salvia-300 bg-salvia-50 text-salvia-700";
  const icono = h.nivel === "critico" ? "⛔" : h.nivel === "aviso" ? "⚠️" : "✅";
  return (
    <div className={`card flex gap-3 text-sm ${estilo}`}>
      <span aria-hidden>{icono}</span>
      <p>{h.texto}</p>
    </div>
  );
}

function PrecioCard({ p }: { p: PrecioDiag }) {
  const euros = (c?: number) => (c == null ? "—" : `${(c / 100).toFixed(2)} €`);
  return (
    <div className={`card text-sm ${p.encontrado ? "" : "border-calido-300 bg-calido-50"}`}>
      <p className="font-bold text-marino-800">Plan {p.plan === "BASICO" ? "Básico" : "Completo"}</p>
      <p className="text-xs text-marino-400">{p.variable}</p>
      {!p.definida ? (
        <p className="mt-2 font-semibold text-calido-700">Sin definir en el entorno.</p>
      ) : !p.encontrado ? (
        <p className="mt-2 font-semibold text-calido-700">Stripe no lo reconoce: {p.error}</p>
      ) : (
        <dl className="mt-2 space-y-1 text-marino-600">
          <Dato k="Cobra" v={`${euros(p.importeCents)} / ${p.intervalo ?? "?"}`} />
          <Dato k="La web anuncia" v={euros(p.importeWebCents)} />
          <Dato k="Modo" v={p.modo ?? "?"} />
          <Dato k="Estado" v={p.activo ? "activo" : "ARCHIVADO"} />
          <Dato k="IVA" v={p.impuesto ?? "sin definir"} />
          <Dato k="Producto" v={p.producto ?? "—"} />
        </dl>
      )}
    </div>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-marino-400">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
