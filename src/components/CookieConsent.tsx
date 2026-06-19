"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Consentimiento de cookies (RGPD + LSSI). Se guarda en una cookie PROPIA de primera parte
// (no localStorage), legible también en servidor y persistente entre visitas.
// Las cookies no esenciales (analítica) solo se activan si el usuario las acepta.

const COOKIE_NAME = "gescuida_cc";
const MAX_AGE_DAYS = 180; // la AEPD recomienda renovar el consentimiento periódicamente
const VERSION = 2; // v2: añadida la categoría "chat" (Crisp). Al subir, se re-pregunta una vez.

interface Consent {
  v: number;
  necessary: true;
  analytics: boolean;
  chat: boolean; // cookies funcionales del chat de soporte (Crisp)
  ts: string;
}

function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!m) return null;
  try {
    const c = JSON.parse(decodeURIComponent(m[1])) as Consent;
    return c.v === VERSION ? c : null; // si cambia la versión, re-preguntar
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(c))}` +
    `; Max-Age=${MAX_AGE_DAYS * 24 * 60 * 60}; Path=/; SameSite=Lax${secure}`;
}

// Punto de integración: aquí se activan las herramientas no esenciales SOLO con consentimiento.
function applyConsent(c: Consent) {
  if (typeof window !== "undefined") {
    (window as unknown as { __gescuidaConsent?: Consent }).__gescuidaConsent = c;
    // Se notifica SIEMPRE (acepte o rechace) para que los listeners —Google Analytics, etc.—
    // reaccionen también a la REVOCACIÓN del consentimiento, no solo a la aceptación.
    // Cada listener decide qué hacer leyendo detail.analytics.
    window.dispatchEvent(new CustomEvent("gescuida-consent", { detail: c }));
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [chat, setChat] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      setVisible(true); // primera visita: pedir consentimiento antes de nada no esencial
    }
  }, []);

  function decide(opts: { analytics: boolean; chat: boolean }) {
    const c: Consent = {
      v: VERSION,
      necessary: true,
      analytics: opts.analytics,
      chat: opts.chat,
      ts: new Date().toISOString(),
    };
    writeConsent(c);
    applyConsent(c);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-marino-100 bg-crema-50 p-5 shadow-xl sm:p-6">
        <h2 className="text-lg font-bold text-marino-800">🍪 Tu privacidad</h2>
        <p className="mt-2 text-sm text-marino-700">
          Usamos cookies <strong>necesarias</strong> para que la web funcione y, solo con tu
          permiso, cookies <strong>analíticas</strong> para mejorar el sitio. Puedes aceptarlas,
          rechazarlas o configurarlas. Más información en nuestra{" "}
          <Link href="/cookies" className="font-semibold text-calido-700 underline">
            Política de Cookies
          </Link>{" "}
          y en la{" "}
          <Link href="/privacidad" className="font-semibold text-calido-700 underline">
            Política de Privacidad
          </Link>
          .
        </p>

        {/* Capa de configuración por categorías */}
        {config && (
          <div className="mt-4 space-y-2">
            <div className="flex items-start justify-between gap-3 rounded-xl bg-salvia-50 px-4 py-3">
              <div>
                <p className="font-semibold text-marino-800">Necesarias</p>
                <p className="text-xs text-marino-600">
                  Imprescindibles para iniciar sesión y para el funcionamiento básico. No se pueden
                  desactivar.
                </p>
              </div>
              <span className="badge shrink-0 bg-salvia-200 text-salvia-800">Siempre activas</span>
            </div>
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-marino-100 bg-white px-4 py-3">
              <div>
                <p className="font-semibold text-marino-800">Analíticas</p>
                <p className="text-xs text-marino-600">
                  Nos ayudan a medir el uso del sitio para mejorarlo. Opcionales.
                </p>
              </div>
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-calido-500"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                aria-label="Activar cookies analíticas"
              />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-marino-100 bg-white px-4 py-3">
              <div>
                <p className="font-semibold text-marino-800">Funcionales (chat)</p>
                <p className="text-xs text-marino-600">
                  Activan el chat de soporte para escribirnos tus dudas. Opcionales.
                </p>
              </div>
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-calido-500"
                checked={chat}
                onChange={(e) => setChat(e.target.checked)}
                aria-label="Activar cookies funcionales del chat"
              />
            </label>
          </div>
        )}

        {/* Acciones — "Aceptar" y "Rechazar" tienen el MISMO nivel/tamaño (exigencia AEPD) */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {!config ? (
            <>
              <button
                type="button"
                onClick={() => decide({ analytics: true, chat: true })}
                className="btn-primary flex-1"
              >
                Aceptar todas
              </button>
              <button
                type="button"
                onClick={() => decide({ analytics: false, chat: false })}
                className="btn-secondary flex-1"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => setConfig(true)}
                className="btn-ghost flex-1 sm:flex-none"
              >
                Configurar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => decide({ analytics, chat })}
                className="btn-primary flex-1"
              >
                Guardar preferencias
              </button>
              <button
                type="button"
                onClick={() => decide({ analytics: false, chat: false })}
                className="btn-secondary flex-1"
              >
                Rechazar todas
              </button>
              <button
                type="button"
                onClick={() => decide({ analytics: true, chat: true })}
                className="btn-ghost flex-1 sm:flex-none"
              >
                Aceptar todas
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
