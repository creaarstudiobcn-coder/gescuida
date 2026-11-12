import Link from "next/link";
import { PUEBLOS_SEO } from "@/lib/pueblos";
import { POBLES_CA } from "@/lib/pueblos-ca";

// Enlaces internos entre las páginas de zona (refuerzo SEO + navegación).
// Se usa en la home y en cada página de pueblo (excluyendo el municipio actual).
export function ZonasLinks({
  excludeSlug,
  titulo = "Zonas donde operamos",
  texto = "Conectamos familias y cuidadoras en Barcelona, el Maresme y municipios de la provincia.",
  idioma = "es",
  conCatalan = false,
}: {
  excludeSlug?: string;
  titulo?: string;
  texto?: string;
  /** "ca" enlaza a las páginas /ca/cuidadors/ (solo los municipios con versión catalana). */
  idioma?: "es" | "ca";
  /** Añade debajo una línea con las páginas en catalán (para la portada). */
  conCatalan?: boolean;
}) {
  const base = idioma === "ca" ? POBLES_CA : PUEBLOS_SEO;
  const ruta = idioma === "ca" ? "/ca/cuidadors" : "/cuidadoras";
  const pueblos = base.filter((p) => p.slug !== excludeSlug);
  if (pueblos.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-center text-2xl font-bold text-marino-800">{titulo}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-marino-600">
        {texto}
      </p>
      <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2.5">
        {pueblos.map((p) => (
          <li key={p.slug}>
            <Link
              href={`${ruta}/${p.slug}`}
              hrefLang={idioma}
              className="inline-flex rounded-full border border-marino-200 bg-white px-4 py-2 text-sm font-semibold text-marino-700 transition hover:border-calido-400 hover:bg-calido-50 hover:text-calido-700"
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
      {conCatalan && (
        <p className="mx-auto mt-5 max-w-3xl text-center text-sm text-marino-600">
          En català:{" "}
          {POBLES_CA.map((p, i) => (
            <span key={p.slug}>
              {i > 0 && " · "}
              <Link href={`/ca/cuidadors/${p.slug}`} hrefLang="ca" className="underline hover:text-calido-700">
                {p.name}
              </Link>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
