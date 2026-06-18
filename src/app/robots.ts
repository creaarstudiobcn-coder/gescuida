import type { MetadataRoute } from "next";

const BASE = "https://gescuida.es";

// Permite rastrear las páginas públicas y bloquea las áreas privadas (paneles + API).
// NOTA: la ruta del panel de administración NO se lista aquí a propósito. robots.txt es
// público, y disallow-earla revelaría su ubicación. El panel queda protegido por el
// control de acceso por rol (middleware + requireRole) y por `noindex`, que es lo que
// realmente impide su indexación.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/familia", "/cuidadora", "/api", "/post-login"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
