import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GesCuida — Cuidado a domicilio en el Maresme",
    short_name: "GesCuida",
    description:
      "Plataforma de conexión con cuidadoras profesionales e independientes en Mataró y el Maresme.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7EF",
    theme_color: "#2E9B72",
    icons: [
      { src: "/favicon/favicon-180.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon/favicon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
