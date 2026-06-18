import type { MetadataRoute } from "next";

// Dominio base de producción (Search Console usará estas URLs).
const BASE = "https://gescuida.es";

// Solo páginas PÚBLICAS e indexables. NO se incluyen:
//  - paneles privados (/familia, /cuidadora, /admin) ni la API,
//  - páginas legales en borrador (/terminos, /privacidad, /aviso-legal) — llevan noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${BASE}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/register`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
