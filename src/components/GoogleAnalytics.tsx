"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Google Analytics 4 con consentimiento (RGPD + LSSI).
// El script de GA SOLO se inyecta cuando el usuario ha ACEPTADO la analítica en el banner
// (cookie `gescuida_cc` con analytics: true). Mientras no acepte —o si rechaza— no se carga
// nada de Google ni se ponen sus cookies (_ga, _gid, _ga_*).
//
// Se sincroniza con el banner a través de:
//   · window.__gescuidaConsent  → estado inicial (consentimiento ya guardado)
//   · evento "gescuida-consent" → cambios en caliente (aceptar / rechazar / reconfigurar)

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Rutas privadas (paneles autenticados): no medimos analítica de uso en ellas.
const PRIVATE_PREFIXES = ["/familia", "/cuidadora", "/gestion-9k2p7"];

interface Consent {
  analytics?: boolean;
}

// Borra las cookies de GA en todas las variantes de dominio posibles (host, .host, dominio raíz).
function clearGaCookies() {
  if (typeof document === "undefined") return;
  const host = location.hostname;
  const root = host.replace(/^www\./, "");
  const domains = Array.from(new Set([host, `.${host}`, root, `.${root}`]));
  document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n === "_gid" || n.startsWith("_ga_") || n.startsWith("_gat"))
    .forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
      domains.forEach((d) => {
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${d}`;
      });
    });
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (!GA_ID) return;

    function sync(analyticsAllowed: boolean) {
      setEnabled((wasEnabled) => {
        if (analyticsAllowed) return true;
        // Revocación: estaba activo y el usuario lo desactiva → desactivar GA, limpiar sus
        // cookies y recargar para garantizar que no quede nada cargado en memoria.
        if (wasEnabled && GA_ID) {
          (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true;
          clearGaCookies();
          location.reload();
        }
        return false;
      });
    }

    // Estado inicial: si el usuario ya había decidido en una visita anterior.
    const initial = (window as unknown as { __gescuidaConsent?: Consent }).__gescuidaConsent;
    if (initial) sync(Boolean(initial.analytics));

    // Cambios en caliente desde el banner.
    const handler = (e: Event) => sync(Boolean((e as CustomEvent<Consent>).detail?.analytics));
    window.addEventListener("gescuida-consent", handler);
    return () => window.removeEventListener("gescuida-consent", handler);
  }, []);

  // Sin ID configurado, sin consentimiento, o en paneles privados → no se carga nada.
  if (!GA_ID || !enabled || isPrivate) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
