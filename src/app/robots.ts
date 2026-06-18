import type { MetadataRoute } from "next";

const BASE = "https://gescuida.es";

// Permite rastrear las páginas públicas y bloquea las áreas privadas (paneles + API).
// Las páginas legales en borrador NO se bloquean aquí a propósito: llevan `noindex`,
// y para que Google respete ese noindex debe poder rastrearlas (si las bloqueáramos,
// no vería la etiqueta). Tampoco están enlazadas ni en el sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/familia", "/cuidadora", "/admin", "/api", "/post-login"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
