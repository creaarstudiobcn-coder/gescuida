import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ChatWidget } from "@/components/ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

// Tipografía de marca: Plus Jakarta Sans (800 logotipo/títulos, 600 subtítulos).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  /* El canónico del sitio es CON www: el ápex devuelve un 308 a www y Google ya
     tiene todo indexado ahí (comprobado con la API de inspección el 6/8/2026).
     Con el ápex aquí, cada canonical y cada og:url apuntaban a una URL que
     vuelve a redirigir. */
  metadataBase: new URL("https://www.gescuida.es"),
  title: "GesCuida — Encuentra cuidadora de confianza en Mataró y el Maresme",
  description:
    "Plataforma de conexión con cuidadoras profesionales e independientes en Mataró y el Maresme. Tú eliges, contactas y acuerdas el cuidado directamente con ellas.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon/favicon-180.png",
  },
  // Vista previa al compartir el enlace (WhatsApp, redes). 1200×630.
  openGraph: {
    images: [
      {
        url: "/og-portada.jpg",
        width: 1200,
        height: 630,
        alt: "GesCuida — Encuentra cuidadora de confianza en Mataró y el Maresme",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2E9B72",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className="min-h-dvh">
        {children}
        {/* Footer global, al final del layout y fuera del contenido de cada página.
            SiteFooter decide según la ruta: solo se muestra en páginas públicas y se
            oculta en zonas privadas (paneles) y pantallas de autenticación. */}
        <SiteFooter />
        <CookieConsent />
        <GoogleAnalytics />
        <ChatWidget />
      </body>
    </html>
  );
}
