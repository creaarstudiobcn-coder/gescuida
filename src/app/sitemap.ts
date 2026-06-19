import type { MetadataRoute } from "next";
import { pueblosSlugs } from "@/lib/pueblos";

// Dominio base de producción (Search Console usará estas URLs).
const BASE = "https://gescuida.es";

// Solo páginas PÚBLICAS e indexables. NO se incluyen los paneles privados
// (familia, cuidadora ni el panel de administración) ni la API. Las páginas legales,
// ya publicadas (sin noindex), sí se incluyen con prioridad baja.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Páginas de SEO local por municipio del Maresme: se añaden solas al crecer la lista.
  const zonas: MetadataRoute.Sitemap = pueblosSlugs().map((slug) => ({
    url: `${BASE}/cuidadoras/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: `${BASE}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/register`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    ...zonas,
    { url: `${BASE}/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terminos`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacidad`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookies`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/aviso-legal`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
