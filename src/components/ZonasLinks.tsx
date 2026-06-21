import Link from "next/link";
import { PUEBLOS_SEO } from "@/lib/pueblos";

// Enlaces internos entre las páginas de zona (refuerzo SEO + navegación).
// Se usa en la home y en cada página de pueblo (excluyendo el municipio actual).
export function ZonasLinks({ excludeSlug }: { excludeSlug?: string }) {
  const pueblos = PUEBLOS_SEO.filter((p) => p.slug !== excludeSlug);
  if (pueblos.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-center text-2xl font-bold text-marino-800">Zonas donde operamos</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-marino-600">
        Conectamos familias y cuidadoras en Barcelona, el Maresme y municipios de la provincia.
      </p>
      <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2.5">
        {pueblos.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/cuidadoras/${p.slug}`}
              className="inline-flex rounded-full border border-marino-200 bg-white px-4 py-2 text-sm font-semibold text-marino-700 transition hover:border-calido-400 hover:bg-calido-50 hover:text-calido-700"
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
