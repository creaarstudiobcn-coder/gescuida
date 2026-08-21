// Host canónico de la web, normalizado en código.
//
// Google tiene indexado `www.gescuida.es` y el servidor devuelve un 308 del ápex a www
// (ver el commit que alineó los canonical). Cualquier enlace que construyamos debe nacer
// ya en www: el `success_url` al volver de pagar y los enlaces de los correos pasaban por
// una redirección de más porque NEXT_PUBLIC_APP_URL vale «https://gescuida.es».
//
// Se corrige aquí y no en la variable de entorno a propósito: las de Vercel son
// `Sensitive` y el proyecto vive en otra cuenta, así que el código no puede dar por hecho
// que estén bien puestas.

const APEX = "gescuida.es";
const CANONICO = "https://www.gescuida.es";

export function normalizarSiteUrl(valor: string | undefined | null): string {
  const limpio = valor?.trim().replace(/\/+$/, "");
  if (!limpio) {
    return process.env.NODE_ENV === "production" ? CANONICO : "http://localhost:3000";
  }
  try {
    const url = new URL(limpio);
    if (url.hostname === APEX) url.hostname = `www.${APEX}`;
    return url.origin;
  } catch {
    // Valor que no es una URL válida: mejor el canónico que un enlace roto en un correo.
    return CANONICO;
  }
}

export const SITE_URL = normalizarSiteUrl(process.env.NEXT_PUBLIC_APP_URL);
