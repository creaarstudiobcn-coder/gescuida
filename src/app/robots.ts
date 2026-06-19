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
        // OJO: "/cuidadora" a secas bloquearía también "/cuidadoras/..." (páginas SEO de zona)
        // por coincidencia de prefijo. Usamos "$" para el panel exacto y "/cuidadora/" para sus
        // subrutas, dejando "/cuidadoras/<pueblo>" rastreable e indexable.
        disallow: ["/familia", "/cuidadora$", "/cuidadora/", "/api", "/post-login"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
