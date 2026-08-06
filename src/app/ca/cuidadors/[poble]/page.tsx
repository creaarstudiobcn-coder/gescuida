import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatHourlyRange } from "@/lib/pricing";
import { getPobleCa, POBLES_CA_SLUGS } from "@/lib/pueblos-ca";

const BASE = "https://www.gescuida.es"; // con www: ver el comentario de layout.tsx

/**
 * Versión en catalán de /cuidadoras/[pueblo], para los siete municipios que
 * concentran el 97% de la demanda catalana. El porqué está en lib/pueblos-ca.ts.
 *
 * Es una página PROPIA y no un refactor de la castellana a propósito: aquella
 * son casi 300 líneas con Stripe y Prisma detrás, en producción, y partirla en
 * dos por una prueba era arriesgarla sin necesidad. Lo único que se repite es la
 * consulta de cuidadoras, doce líneas.
 *
 * `zone` usa p.name SIN traducir: es la cadena exacta con la que se filtra en
 * CaregiverProfile.zones. Traducirla dejaría la página sin ninguna cuidadora.
 */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return POBLES_CA_SLUGS.map((poble) => ({ poble }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ poble: string }>;
}): Promise<Metadata> {
  const { poble } = await params;
  const p = getPobleCa(poble);
  if (!p) return {};
  const url = `${BASE}/ca/cuidadors/${p.slug}`;
  const es = `${BASE}/cuidadoras/${p.slug}`;
  return {
    title: p.seoTitle,
    description: p.seoDescription,
    alternates: {
      canonical: url,
      /* Recíproco: la castellana declara la catalana desde su propia ruta. Si
         solo lo declara una de las dos, Google lo ignora. */
      languages: { ca: url, es },
    },
    openGraph: { title: p.seoTitle, description: p.seoDescription, url, type: "website", locale: "ca_ES" },
  };
}

async function cuidadoresA(zone: string) {
  try {
    return await prisma.caregiverProfile.findMany({
      where: { verified: true, suspended: false, zones: { has: zone } },
      select: {
        id: true,
        bio: true,
        training: true,
        photoUrl: true,
        hourlyRateMinCents: true,
        hourlyRateMaxCents: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    /* Sin BD al construir, la página se renderiza igual y el ISR la rellena. */
    console.warn(`[ca/cuidadors/${zone}] BD no disponible:`, e instanceof Error ? e.message : e);
    return [];
  }
}

export default async function CuidadorsPoblePage({
  params,
}: {
  params: Promise<{ poble: string }>;
}) {
  const { poble } = await params;
  const p = getPobleCa(poble);
  if (!p) notFound();

  const cuidadores = await cuidadoresA(p.name);
  const url = `${BASE}/ca/cuidadors/${p.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Cuidadores de gent gran a ${p.name}`,
    description: p.seoDescription,
    url,
    inLanguage: "ca",
    areaServed: {
      "@type": "City",
      name: p.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: `${p.comarca ?? "Maresme"}, Barcelona`,
      },
    },
    provider: { "@type": "Organization", name: "GesCuida", url: BASE },
  };

  return (
    <main lang="ca" className="mx-auto max-w-5xl px-5 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="flex items-center justify-between py-5">
        <Link href="/" aria-label="GesCuida — inici">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/gescuida-logo-horizontal.svg"
            alt="GesCuida"
            width={170}
            height={48}
            className="h-10 w-auto sm:h-12"
          />
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/login" className="btn-ghost px-3 text-sm sm:px-4 sm:text-base">
            Entrar
          </Link>
          <Link href="/register" className="btn-primary px-4 text-sm sm:px-5 sm:text-base">
            Comença
          </Link>
        </nav>
      </header>

      <p className="mt-2 text-sm text-marino-400">
        <Link href="/" className="hover:underline">
          Inici
        </Link>{" "}
        / <span className="text-marino-600">Cuidadores a {p.name}</span>
      </p>

      <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
        Cuidadores de gent gran a {p.name}
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-marino-600">{p.hero}</p>

      {p.sections.map((s) => (
        <section key={s.h2} className="mt-12">
          <h2 className="text-2xl font-bold text-marino-800">{s.h2}</h2>
          {s.body.map((b) => (
            <p key={b} className="mt-3 max-w-3xl text-marino-600">
              {b}
            </p>
          ))}
        </section>
      ))}

      {/* Cuidadores de la zona, de la base de datos */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-marino-800">Cuidadores a {p.name}</h2>
        {cuidadores.length > 0 ? (
          <>
            <p className="mt-2 text-marino-600">
              Aquestes cuidadores tenen {p.name} entre les seves zones de treball. Registreu-vos com a
              família per contactar-hi.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {cuidadores.map((c) => (
                <article key={c.id} className="card flex gap-4">
                  {c.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.photoUrl}
                      alt={`Cuidadora ${c.user.name} a ${p.name}`}
                      className="h-16 w-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-salvia-100 text-2xl font-extrabold text-marino-700">
                      {c.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-marino-800">{c.user.name}</h3>
                    <p className="text-sm font-semibold text-calido-700">
                      {formatHourlyRange(c.hourlyRateMinCents, c.hourlyRateMaxCents)}
                    </p>
                    {c.training && <p className="mt-1 text-sm text-marino-500">{c.training}</p>}
                    {c.bio && <p className="mt-2 text-marino-600">{c.bio}</p>}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-salvia-200 bg-salvia-50 p-6">
            <p className="text-marino-800">
              Encara no tenim cuidadores donades d&apos;alta específicament a <strong>{p.name}</strong>.
              Registreu-vos i us avisarem quan n&apos;hi hagi.
            </p>
          </div>
        )}
      </section>

      {p.paraFamilias && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-marino-800">
            {p.paraFamilias.titulo ?? "Per a famílies"}
          </h2>
          {p.paraFamilias.body.map((b) => (
            <p key={b} className="mt-3 max-w-3xl text-marino-600">
              {b}
            </p>
          ))}
        </section>
      )}

      {p.paraCuidadoras && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-marino-800">
            {p.paraCuidadoras.titulo ?? "Per a cuidadores"}
          </h2>
          {p.paraCuidadoras.body.map((b) => (
            <p key={b} className="mt-3 max-w-3xl text-marino-600">
              {b}
            </p>
          ))}
        </section>
      )}

      <p className="mt-14 text-sm text-marino-500">
        Aquesta pàgina també està disponible en{" "}
        <a href={`/cuidadoras/${p.slug}`} hrefLang="es" className="underline hover:text-marino-700">
          castellà
        </a>
        .
      </p>
    </main>
  );
}
