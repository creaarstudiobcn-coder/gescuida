"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

// El footer público (logo, redes, legales, disclaimer) solo debe salir en las
// páginas públicas. Aquí se ocultan las zonas privadas (paneles de cuenta/gestión)
// y las pantallas de autenticación, donde un footer corporativo se ve fuera de lugar.
const HIDDEN_PREFIXES = [
  // Autenticación
  "/login",
  "/post-login",
  "/register",
  "/recuperar",
  "/restablecer",
  // Paneles privados
  "/gestion-9k2p7", // panel admin
  "/cuidadora", // dashboard cuidadora
  "/familia", // dashboard familia
];

export function SiteFooter() {
  const pathname = usePathname();

  // Frontera con "/" para no confundir "/cuidadoras/[pueblo]" (página pública de
  // ciudad) con "/cuidadora" (dashboard privado): difieren solo por una "s".
  const hidden = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );

  if (hidden) return null;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20">
      <Footer />
    </div>
  );
}
