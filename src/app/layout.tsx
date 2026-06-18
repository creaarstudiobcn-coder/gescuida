import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuidado Mataró — Cuidado de mayores a domicilio en el Maresme",
  description:
    "Reserva y paga cuidado a domicilio para tus mayores desde el móvil. Cuidadoras de confianza en Mataró y el Maresme.",
};

export const viewport: Viewport = {
  themeColor: "#2d5f59",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
