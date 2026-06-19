import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatHourlyRange } from "@/lib/pricing";
import { getPueblo, pueblosSlugs } from "@/lib/pueblos";
import { ZonasLinks } from "@/components/ZonasLinks";

const BASE = "https://gescuida.es";

// Páginas estáticas (ISR): se generan en build y se refrescan cada hora para que el listado
// de cuidadoras se mantenga al día sin reconstruir todo el sitio.
export const revalidate = 3600;

export function generateStaticParams() {
  return pueblosSlugs().map((pueblo) => ({ pueblo }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pueblo: string }>;
}): Promise<Metadata> {
  const { pueblo } = await params;
  const p = getPueblo(pueblo);
  if (!p) return {};
  const url = `${BASE}/cuidadoras/${p.slug}`;
  return {
    title: p.seoTitle,
    description: p.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: p.seoTitle,
      description: p.seoDescription,
      url,
      type: "website",
    },
  };
}

// Cuidadoras verificadas, activas, cuya zona de trabajo incluye este municipio.
// Si la BD no está disponible al construir (build sin conexión), devolvemos lista vacía para
// no romper el deploy: la página se renderiza igual y el ISR (revalidate) la rellenará después.
async function caregiversIn(zone: string) {
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
    console.warn(`[cuidadoras/${zone}] BD no disponible al renderizar:`, e instanceof Error ? e.message : e);
    return [];
  }
}

export default async function CuidadorasPuebloPage({
  params,
}: {
  params: Promise<{ pueblo: string }>;
}) {
  const { pueblo } = await params;
  const p = getPueblo(pueblo);
  if (!p) notFound();

  const cuidadoras = await caregiversIn(p.name);

  // Datos estructurados Schema.org (Service + área servida). Solo datos reales.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Cuidadoras de mayores en ${p.name}`,
    serviceType: "Conexión con cuidadoras de personas mayores a domicilio",
    url: `${BASE}/cuidadoras/${p.slug}`,
    areaServed: {
      "@type": "City",
      name: p.name,
      containedInPlace: { "@type": "AdministrativeArea", name: "Maresme, Barcelona" },
    },
    provider: {
      "@type": "Organization",
      name: "GesCuida",
      url: BASE,
    },
  };

  return (
    <main className="mx-auto max-w-5xl px-5 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cabecera */}
      <header className="flex items-center justify-between py-5">
        <Link href="/" aria-label="GesCuida — inicio">
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
            Empezar
          </Link>
        </nav>
      </header>

      {/* Migas */}
      <p className="mt-2 text-sm text-marino-400">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>{" "}
        / <span className="text-marino-600">Cuidadoras en {p.name}</span>
      </p>

      {/* Hero */}
      <section className="mt-3 rounded-3xl bg-gradient-to-br from-marino-800 to-calido-600 px-6 py-12 text-white shadow-lg">
        <span className="badge bg-white/15 text-salvia-50">
          {p.geo === "costero" ? "Maresme · costa" : "Maresme · interior"}
        </span>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
          Cuidadora de mayores en {p.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-salvia-50">{p.hero}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register?role=FAMILIA"
            className="btn-primary bg-white text-marino-800 hover:bg-salvia-50 text-lg"
          >
            Soy una familia
          </Link>
          <Link
            href="/register?role=CUIDADORA"
            className="btn-secondary border-white bg-transparent text-white hover:bg-white/10 text-lg"
          >
            Soy cuidadora
          </Link>
        </div>
      </section>

      {/* Secciones de contenido único (estructura variable por pueblo) */}
      <div className="mt-12 space-y-10">
        {p.sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-2xl font-bold text-marino-800">{s.h2}</h2>
            <div className="mt-3 space-y-3 text-marino-700">
              {s.body.map((par, j) => (
                <p key={j} className="text-base leading-relaxed sm:text-lg">
                  {par}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Cuidadoras de la zona (contenido real de la BD) */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-marino-800">Cuidadoras en {p.name}</h2>
        {cuidadoras.length > 0 ? (
          <>
            <p className="mt-2 text-marino-600">
              Estas cuidadoras tienen {p.name} entre sus zonas de trabajo. Regístrate como familia
              para contactar con ellas.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {cuidadoras.map((c) => (
                <article key={c.id} className="card flex gap-4">
                  {c.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.photoUrl}
                      alt={`Cuidadora ${c.user.name} en ${p.name}`}
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
              Todavía no tenemos cuidadoras dadas de alta específicamente en <strong>{p.name}</strong>
              . Estamos creciendo por todo el Maresme: deja tu registro como familia y te avisaremos
              en cuanto haya cuidadoras disponibles en tu zona.
            </p>
            <p className="mt-3 text-marino-700">
              ¿Eres cuidadora y trabajas en {p.name}? <strong>Sé de las primeras en aparecer aquí.</strong>
            </p>
          </div>
        )}
      </section>

      {/* Doble llamada a la acción */}
      <section className="mt-14 grid gap-5 sm:grid-cols-2">
        <div className="card flex flex-col">
          <h3 className="text-xl font-extrabold text-marino-800">Para familias</h3>
          <p className="mt-2 flex-1 text-marino-600">{p.familias}</p>
          <Link href="/register?role=FAMILIA" className="btn-primary mt-5">
            Buscar cuidadora
          </Link>
        </div>
        <div className="card flex flex-col">
          <h3 className="text-xl font-extrabold text-marino-800">Para cuidadoras</h3>
          <p className="mt-2 flex-1 text-marino-600">{p.cuidadoras}</p>
          <Link href="/register?role=CUIDADORA" className="btn-secondary mt-5">
            Registrarme gratis
          </Link>
        </div>
      </section>

      {/* FAQ (si el pueblo la define) */}
      {p.faq && p.faq.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-marino-800">Preguntas frecuentes</h2>
          <div className="mt-5 space-y-3">
            {p.faq.map((f, i) => (
              <details key={i} className="card">
                <summary className="cursor-pointer font-semibold text-marino-800">{f.q}</summary>
                <p className="mt-2 text-marino-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Interlinking de zonas */}
      <ZonasLinks excludeSlug={p.slug} />

      {/* Footer */}
      <footer className="mt-16 rounded-2xl bg-marino-900 px-6 py-8 text-center text-sm text-salvia-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/gescuida-logo-horizontal-oscuro.svg"
          alt="GesCuida"
          width={160}
          height={45}
          className="mx-auto h-10 w-auto sm:h-11"
        />
        <p className="mt-3">Mataró i el Maresme</p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/terminos" className="underline hover:text-white">
            Términos y Condiciones
          </Link>
          <Link href="/privacidad" className="underline hover:text-white">
            Política de Privacidad
          </Link>
          <Link href="/cookies" className="underline hover:text-white">
            Cookies
          </Link>
          <Link href="/aviso-legal" className="underline hover:text-white">
            Aviso Legal
          </Link>
        </nav>
        <p className="mt-4 text-xs text-salvia-200/80">
          GesCuida es una marca de Dependalium Global Services, S.L. · Plataforma de conexión; no
          emplea a las cuidadoras ni presta el servicio de cuidado.
        </p>
      </footer>
    </main>
  );
}
