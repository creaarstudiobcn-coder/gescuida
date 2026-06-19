"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

// Chat de soporte (Crisp) con consentimiento (RGPD + LSSI).
// El script de Crisp SOLO se inyecta cuando el usuario ha ACEPTADO las cookies
// funcionales del chat en el banner (cookie `gescuida_cc` con chat: true).
// Mientras no acepte —o si rechaza— no se carga nada de Crisp ni se ponen sus
// cookies. Mismo patrón que GoogleAnalytics.tsx:
//   · window.__gescuidaConsent  → estado inicial (consentimiento ya guardado)
//   · evento "gescuida-consent" → cambios en caliente (aceptar / rechazar / reconfigurar)

const CRISP_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

interface Consent {
  chat?: boolean;
}

export function CrispChat() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!CRISP_ID) return;

    function sync(chatAllowed: boolean) {
      setEnabled((wasEnabled) => {
        if (chatAllowed) return true;
        // Revocación: estaba activo y el usuario lo desactiva → recargamos para
        // garantizar que Crisp no queda cargado en memoria ni sigue poniendo cookies.
        if (wasEnabled) location.reload();
        return false;
      });
    }

    // Estado inicial: si el usuario ya había decidido en una visita anterior.
    const initial = (window as unknown as { __gescuidaConsent?: Consent }).__gescuidaConsent;
    if (initial) sync(Boolean(initial.chat));

    // Cambios en caliente desde el banner.
    const handler = (e: Event) => sync(Boolean((e as CustomEvent<Consent>).detail?.chat));
    window.addEventListener("gescuida-consent", handler);
    return () => window.removeEventListener("gescuida-consent", handler);
  }, []);

  // Sin ID configurado o sin consentimiento → no se carga nada.
  if (!CRISP_ID || !enabled) return null;

  return (
    <>
      <Script id="crisp-init" strategy="afterInteractive">
        {`window.$crisp=[];window.CRISP_WEBSITE_ID="${CRISP_ID}";`}
      </Script>
      <Script src="https://client.crisp.chat/l.js" strategy="afterInteractive" />
    </>
  );
}
