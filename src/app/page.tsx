import Link from "next/link";
import Image from "next/image";
import { ACCESS_PLANS, formatEuros } from "@/lib/pricing";
import { FOTO_PORTADA, FOTO_CONFIANZA } from "@/lib/fotos";
import { ZonasLinks } from "@/components/ZonasLinks";
import { CuidadorasProceso } from "@/components/CuidadorasProceso";
import type { Metadata } from "next";

// Canónica de la portada: con metadataBase en www, "/" sale como
// https://www.gescuida.es, que es el host que sirve la web (el ápex redirige).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const PASOS = [
  {
    n: "1",
    t: "Elige tu plan",
    d: "Suscríbete para acceder a la plataforma y a las cuidadoras de tu zona.",
  },
  {
    n: "2",
    t: "Reserva una visita",
    d: "Indica día y hora; las cuidadoras cercanas la aceptan.",
  },
  {
    n: "3",
    t: "Contacta y acuerda",
    d: "Habláis por el chat, ves su tarifa y acordáis el cuidado.",
  },
  {
    n: "4",
    t: "Cuidado en casa",
    d: "La cuidadora acude al domicilio; el pago del cuidado es entre vosotros.",
  },
];

export default function HomePage() {
  return (
    <main className="pb-4">
      {/* Cabecera a ancho completo; el logo manda. */}
      <header className="border-b border-marino-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
          <Link href="/" aria-label="GesCuida — inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/gescuida-logo-horizontal.svg"
              alt="GesCuida"
              width={226}
              height={64}
              className="h-14 w-auto sm:h-20"
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
        </div>
      </header>

      {/* Hero a sangre: la foto ocupa todo el ancho y el texto va encima, sobre un
          degradado verde que garantiza el contraste. `priority`: es la imagen grande
          de la primera pantalla, no debe cargar perezosa. */}
      <section className="relative isolate overflow-hidden bg-marino-900 text-white">
        <Image
          src={FOTO_PORTADA.src}
          alt={FOTO_PORTADA.alt}
          priority
          fill
          sizes="100vw"
          className="-z-10 object-cover object-[70%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-marino-900/85 via-marino-900/70 to-marino-900/90 md:bg-gradient-to-r md:from-marino-900/95 md:via-marino-900/75 md:to-marino-900/10"
        />
        <div className="mx-auto flex min-h-[34rem] max-w-7xl flex-col justify-center px-5 py-16 sm:px-8 md:min-h-[38rem] lg:min-h-[42rem]">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Encuentra cuidadora de confianza en Mataró y el Maresme
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-salvia-50 sm:text-xl">
              Te conectamos con cuidadoras profesionales e independientes. Tú eliges, contactas y
              acuerdas el cuidado directamente con ellas.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?role=FAMILIA" className="btn-primary bg-white text-marino-800 hover:bg-salvia-50 text-lg">
                Soy una familia
              </Link>
              <Link
                href="/register?role=CUIDADORA"
                className="btn-secondary border-white bg-transparent text-white hover:bg-white/10 text-lg"
              >
                Soy cuidadora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Aviso: plataforma de conexión, no agencia. Banda entera, sin caja. */}
      <section className="bg-salvia-50">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <p className="max-w-4xl text-base leading-relaxed text-marino-800 sm:text-lg">
            <strong>Somos una plataforma de conexión, no una agencia.</strong> Tu cuota mensual es
            por usar la plataforma y encontrar cuidadoras. <strong>El precio del cuidado lo pone
            cada cuidadora</strong> y lo acuerdas directamente con ella. No empleamos a las
            cuidadoras: son profesionales independientes.
          </p>
        </div>
      </section>

      {/* Cómo funciona: índice en filas sobre fondo oscuro. */}
      <section className="bg-marino-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr] lg:py-24">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">Cómo funciona</h2>
            <p className="mt-4 max-w-sm text-lg text-salvia-100">
              Cuatro pasos, de buscar a tener a alguien de confianza en casa.
            </p>
          </div>
          <ol className="divide-y divide-white/15 border-y border-white/15">
            {PASOS.map((p) => (
              <li key={p.n} className="grid grid-cols-[3rem_1fr] gap-4 py-6 sm:grid-cols-[5rem_1fr_1.4fr] sm:items-baseline sm:gap-8">
                <span className="text-3xl font-extrabold text-salvia-400 sm:text-5xl">{p.n}</span>
                <h3 className="text-xl font-bold">{p.t}</h3>
                <p className="col-start-2 text-salvia-100 sm:col-start-auto">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Banda de confianza: foto a sangre en una mitad. Pone cara al servicio sin
          prometer nada que no sea cierto. */}
      <section className="grid bg-white md:grid-cols-2">
        <div className="relative h-72 sm:h-96 md:h-auto md:min-h-[32rem]">
          <Image
            src={FOTO_CONFIANZA.src}
            alt={FOTO_CONFIANZA.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-center px-5 py-14 sm:px-10 lg:px-16">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold leading-tight text-marino-800 sm:text-4xl">
              El cuidado lo acuerdas tú, cara a cara
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-marino-700">
              Ves el perfil de cada cuidadora, su experiencia, su zona y su tarifa antes de
              escribirle. Habláis por el chat, quedáis y decidís vosotros. Nosotros no elegimos
              por ti ni nos metemos en medio.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-marino-700">
              Las cuidadoras son profesionales independientes: ellas ponen su precio y sus
              horarios, y tú tratas directamente con ellas.
            </p>
          </div>
        </div>
      </section>

      {/* Planes: dos mitades a ancho completo, el Completo en verde. */}
      <section id="planes" className="bg-crema-50">
        <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:pt-24">
          <h2 className="text-3xl font-extrabold leading-tight text-marino-800 sm:text-4xl">
            Elige tu plan de acceso
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-marino-600">
            Es una cuota por <strong>usar la plataforma</strong> y contactar con cuidadoras.{" "}
            <strong>No incluye el precio del cuidado</strong>, que lo fija cada cuidadora y abonas
            directamente con ella.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2">
          {/* Básico */}
          <div className="flex flex-col border-t border-marino-200 bg-white px-5 py-12 sm:px-8 md:items-end lg:px-16">
            <div className="flex w-full max-w-md flex-1 flex-col">
              <h3 className="text-2xl font-extrabold text-marino-800">{ACCESS_PLANS.BASICO.name}</h3>
              <p className="mt-2 text-5xl font-extrabold text-marino-700">
                {formatEuros(ACCESS_PLANS.BASICO.priceCents)}
                <span className="text-lg font-medium text-marino-400">/mes</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-lg text-marino-600">
                <li>✓ Contacta hasta {ACCESS_PLANS.BASICO.contactLimit} cuidadoras</li>
                <li>✓ Reservas ilimitadas</li>
                <li>✓ Sin permanencia</li>
              </ul>
              <Link href="/register?role=FAMILIA" className="btn-secondary mt-8 self-start">
                Empezar con Básico
              </Link>
            </div>
          </div>

          {/* Completo (destacado) */}
          <div className="flex flex-col bg-calido-500 px-5 py-12 text-white sm:px-8 lg:px-16">
            <div className="flex w-full max-w-md flex-1 flex-col">
              <span className="badge mb-3 self-start bg-white text-calido-700">Más elegido</span>
              <h3 className="text-2xl font-extrabold">{ACCESS_PLANS.COMPLETO.name}</h3>
              <p className="mt-2 text-5xl font-extrabold">
                {formatEuros(ACCESS_PLANS.COMPLETO.priceCents)}
                <span className="text-lg font-medium text-calido-100">/mes</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-lg text-calido-50">
                <li>✓ Contacta hasta {ACCESS_PLANS.COMPLETO.contactLimit} cuidadoras</li>
                <li>✓ Reservas ilimitadas</li>
                <li>✓ Sin permanencia</li>
              </ul>
              <Link
                href="/register?role=FAMILIA"
                className="btn-primary mt-8 self-start bg-white text-calido-700 hover:bg-calido-50"
              >
                Elegir Completo
              </Link>
            </div>
          </div>
        </div>
        <p className="mx-auto max-w-7xl px-5 py-6 text-sm text-marino-500 sm:px-8">
          La cuota es por el uso de la plataforma de conexión. El cuidado se acuerda y se paga
          directamente entre familia y cuidadora.
        </p>
      </section>

      {/* Cuidadoras — proceso de conexión animado */}
      <div className="bg-white">
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-1">
          <CuidadorasProceso />
        </div>
      </div>

      {/* Zonas donde operamos (SEO local + enlaces internos) */}
      <div className="mx-auto max-w-5xl px-5 pb-4">
        <ZonasLinks />
      </div>
    </main>
  );
}
