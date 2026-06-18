"use client";

import { useCallback, useEffect } from "react";

// Hook para reCAPTCHA v3 (invisible). Carga el script de Google y permite obtener un
// token al enviar un formulario, sin retos ni fricción para el usuario.
// Si no hay clave de sitio configurada, no hace nada (los formularios siguen funcionando).

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SCRIPT_ID = "recaptcha-v3-script";

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
}

function getGrecaptcha(): Grecaptcha | undefined {
  return (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
}

function loadScript(): Promise<void> {
  return new Promise((resolve) => {
    if (!SITE_KEY || typeof document === "undefined") return resolve();
    if (document.getElementById(SCRIPT_ID)) return resolve();
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // si falla la carga, seguimos sin bloquear
    document.head.appendChild(s);
  });
}

export function useRecaptcha() {
  // Cargamos el script al montar el formulario para que la puntuación sea más fiable.
  useEffect(() => {
    loadScript();
  }, []);

  const execute = useCallback(async (action: string): Promise<string | undefined> => {
    if (!SITE_KEY) return undefined;
    await loadScript();
    const grecaptcha = getGrecaptcha();
    if (!grecaptcha) return undefined;
    return new Promise<string | undefined>((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(SITE_KEY, { action })
          .then((token) => resolve(token))
          .catch(() => resolve(undefined));
      });
    });
  }, []);

  return { execute };
}
