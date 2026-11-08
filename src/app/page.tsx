import Link from "next/link";
import Image from "next/image";
import { ACCESS_PLANS, formatEuros } from "@/lib/pricing";
import { FOTO_PORTADA, FOTO_CONFIANZA } from "@/lib/fotos";
import { ZonasLinks } from "@/components/ZonasLinks";
import type { Metadata } from "next";

// Canónica de la portada: con metadataBase en www, "/" sale como
// https://www.gescuida.es, que es el host que sirve la web (el ápex redirige).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Portada pensada para que quien llega entienda en diez segundos qué es GesCuida,
// qué NO es, qué tiene que hacer (familia o cuidadora) y qué paga y a quién.
// Filas y bandas a ancho completo; nada de tarjetas con iconos ni números decorativos.

const FAMILIA_PASOS = [
  {
    t: "Mira las cuidadoras de tu pueblo",
    d: "Sin registrarte: ves su experiencia, su zona, su tarifa por hora y cuándo está disponible.",
  },
  {
    t: "Creas tu cuenta y eliges plan",
    d: "El plan es lo que pagas a GesCuida por usar la web. Sin permanencia: lo cancelas cuando quieras.",
  },
  {
    t: "Le escribes o pides una visita",
    d: "Escribes por el chat a la que te guste, o indicas día y hora y las cuidadoras cercanas la aceptan.",
  },
  {
    t: "Acordáis el cuidado entre vosotros",
    d: "Horario, tareas y precio los habláis directamente. El cuidado se lo pagas a ella, no a nosotros.",
  },
];

const CUIDADORA_PASOS = [
  {
    t: "Te registras gratis",
    d: "No pagas nada por estar en GesCuida: ni cuota ni comisión.",
  },
  {
    t: "Rellenas tu perfil",
    d: "Tu experiencia, las zonas donde trabajas, tu tarifa por hora y tus horarios. Por horas o como interna.",
  },
  {
    t: "Las familias de tu zona te ven",
    d: "Te escriben por el chat o te llegan visitas que puedes aceptar.",
  },
  {
    t: "Cobras tú, entero",
    d: "La familia te paga directamente lo que acordéis.",
  },
];

const SI_NO = {
  si: [
    "Una web donde cuidadoras independientes publican su perfil.",
    "Tú las ves, eliges y hablas con ellas por el chat.",
    "Un sitio para que las cuidadoras encuentren familias en su zona.",
  ],
  no: [
    "No somos una agencia: no te asignamos ni te mandamos a nadie.",
    "No cobramos el cuidado: el precio lo pone cada cuidadora.",
    "No contratamos a las cuidadoras: trabajan por su cuenta.",
  ],
};

const B = ACCESS_PLANS.BASICO;
const C = ACCESS_PLANS.COMPLETO;

const PREGUNTAS = [
  {
    q: "¿Me mandáis una cuidadora?",
    a: "No. GesCuida no es una agencia. Tú eliges a la cuidadora entre las de tu zona y acordáis el cuidado entre vosotros.",
  },
  {
    q: "¿Qué pago exactamente?",
    a: `Dos cosas distintas. A GesCuida, la cuota del plan (${formatEuros(B.priceCents)} o ${formatEuros(C.priceCents)} al mes) por usar la web. A la cuidadora, su tarifa por hora, que ves en su perfil y le pagas directamente a ella.`,
  },
  {
    q: "¿Puedo ver las cuidadoras antes de pagar?",
    a: "Sí. En la página de cada pueblo salen las cuidadoras que trabajan allí, con su tarifa y su disponibilidad. Para escribirles necesitas un plan.",
  },
  {
    q: "¿Qué es un «contacto»?",
    a: `Cada cuidadora distinta a la que escribes en el mes. Con el ${B.name} son ${B.contactLimit}; con el ${C.name}, ${C.contactLimit}. Volver a escribir a una que ya contactaste no gasta otro.`,
  },
  {
    q: "¿Hay permanencia?",
    a: "No. Cancelas el plan desde tu cuenta cuando quieras.",
  },
  {
    q: "Soy cuidadora, ¿cuánto me cuesta?",
    a: "Nada. El registro es gratis y no cobramos comisión. Lo que acuerdes con la familia lo cobras tú entero.",
  },
];

function Flecha() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
              className="h-12 w-auto sm:h-20"
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

      {/* Hero: qué es, en una frase, y las dos puertas. Foto ENTERA en la otra mitad. */}
      <section className="grid bg-marino-900 text-white lg:grid-cols-2">
        <div className="flex items-center px-5 py-12 sm:px-8 lg:py-16 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-12">
          <div className="max-w-2xl">
            <h1 className="text-[2.1rem] font-bold leading-[1.1] sm:text-5xl xl:text-[3.4rem]">
              Encuentra cuidadora para tu familiar y trata directamente con ella
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-salvia-50 sm:text-xl">
              GesCuida es una web donde cuidadoras de personas mayores que trabajan por su cuenta
              en Mataró, el Maresme y la provincia de Barcelona publican su perfil. Tú ves su
              tarifa, le escribes y acordáis el cuidado entre vosotros.
            </p>

            <p className="mt-8 text-sm font-semibold text-salvia-200">¿Qué buscas?</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <a
                href="#familias"
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-5 py-4 text-marino-800 transition hover:bg-salvia-50"
              >
                <span>
                  <span className="block text-lg font-bold">Busco cuidadora</span>
                  <span className="block text-sm text-marino-600">Para un familiar</span>
                </span>
                <Flecha />
              </a>
              <a
                href="#cuidadoras"
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-white/70 px-5 py-4 text-white transition hover:bg-white/10"
              >
                <span>
                  <span className="block text-lg font-bold">Soy cuidadora</span>
                  <span className="block text-sm text-salvia-100">Busco familias, gratis</span>
                </span>
                <Flecha />
              </a>
            </div>
            <a href="#zonas" className="mt-5 inline-block text-salvia-100 underline underline-offset-4 hover:text-white">
              O mira ya, sin registrarte, las cuidadoras de tu pueblo
            </a>
          </div>
        </div>
        <div className="flex items-center">
          <Image
            src={FOTO_PORTADA.src}
            alt={FOTO_PORTADA.alt}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto w-full"
          />
        </div>
      </section>

      {/* Lo que somos y lo que no: lo que más confunde, dicho sin rodeos. */}
      <section className="border-b border-marino-100 bg-salvia-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 md:gap-16 lg:py-16">
          <div>
            <h2 className="text-2xl font-bold text-marino-800 sm:text-3xl">Lo que es GesCuida</h2>
            <ul className="mt-5 divide-y divide-marino-800/10 border-y border-marino-800/10">
              {SI_NO.si.map((t) => (
                <li key={t} className="flex gap-3 py-4 text-lg text-marino-800">
                  <span aria-hidden className="font-bold text-calido-500">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-marino-800 sm:text-3xl">Lo que no es</h2>
            <ul className="mt-5 divide-y divide-marino-800/10 border-y border-marino-800/10">
              {SI_NO.no.map((t) => (
                <li key={t} className="flex gap-3 py-4 text-lg text-marino-800">
                  <span aria-hidden className="font-bold text-rose-500">✕</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Familias: qué tienen que hacer. */}
      <section id="familias" className="scroll-mt-4 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-24">
          <div>
            <p className="text-sm font-semibold text-calido-600">Si buscas cuidadora</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-marino-800 sm:text-4xl">
              Lo que tienes que hacer
            </h2>
            <p className="mt-4 text-lg text-marino-600">
              Cuatro pasos, de mirar perfiles a tener a alguien de confianza en casa.
            </p>
            <Link href="/register?role=FAMILIA" className="btn-primary mt-8 text-base">
              Crear mi cuenta de familia
            </Link>
          </div>
          <ol className="divide-y divide-marino-100 border-y border-marino-100">
            {FAMILIA_PASOS.map((p) => (
              <li key={p.t} className="py-6 sm:grid sm:grid-cols-[15rem_1fr] sm:gap-8">
                <h3 className="text-xl font-bold text-marino-800">{p.t}</h3>
                <p className="mt-1 text-lg text-marino-600 sm:mt-0">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Qué pagas y a quién: la duda número uno. */}
        <div className="bg-marino-900 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 md:gap-16 lg:py-16">
            <div>
              <p className="text-sm font-semibold text-salvia-300">A GesCuida</p>
              <p className="mt-2 text-3xl font-bold sm:text-4xl">
                {formatEuros(B.priceCents)} o {formatEuros(C.priceCents)} al mes
              </p>
              <p className="mt-3 text-lg text-salvia-100">
                Por usar la web y escribir a {B.contactLimit} o {C.contactLimit} cuidadoras
                distintas al mes. Sin permanencia.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-salvia-300">A la cuidadora</p>
              <p className="mt-2 text-3xl font-bold sm:text-4xl">Su tarifa por hora</p>
              <p className="mt-3 text-lg text-salvia-100">
                La pone ella y la ves en su perfil antes de escribirle. Se la pagas directamente,
                sin pasar por nosotros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Foto a sangre + el trato cara a cara. */}
      <section className="grid items-center bg-white md:grid-cols-2">
        <Image
          src={FOTO_CONFIANZA.src}
          alt={FOTO_CONFIANZA.alt}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="h-auto w-full"
        />
        <div className="flex items-center px-5 py-14 sm:px-10 lg:px-16">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold leading-tight text-marino-800 sm:text-4xl">
              Tú decides quién entra en casa
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-marino-700">
              Ves el perfil de cada cuidadora antes de escribirle. Habláis por el chat, quedáis y
              decidís vosotros. Nosotros no elegimos por ti ni nos metemos en medio.
            </p>
          </div>
        </div>
      </section>

      {/* Planes: dos mitades a ancho completo, el Completo en verde. */}
      <section id="planes" className="bg-crema-50">
        <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:pt-24">
          <h2 className="text-3xl font-bold leading-tight text-marino-800 sm:text-4xl">
            Elige tu plan
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-marino-600">
            La diferencia es a cuántas cuidadoras distintas puedes escribir cada mes. El cuidado
            se paga aparte, a la cuidadora.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2">
          <div className="flex flex-col border-t border-marino-200 bg-white px-5 py-12 sm:px-8 md:items-end lg:px-16">
            <div className="flex w-full max-w-md flex-1 flex-col">
              <h3 className="text-2xl font-bold text-marino-800">{B.name}</h3>
              <p className="mt-2 text-5xl font-bold text-marino-700">
                {formatEuros(B.priceCents)}
                <span className="text-lg font-medium text-marino-400">/mes</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-lg text-marino-600">
                <li>✓ Escribe hasta a {B.contactLimit} cuidadoras al mes</li>
                <li>✓ Reservas ilimitadas</li>
                <li>✓ Sin permanencia</li>
              </ul>
              <Link href="/register?role=FAMILIA" className="btn-secondary mt-8 self-start">
                Empezar con Básico
              </Link>
            </div>
          </div>

          <div className="flex flex-col bg-calido-500 px-5 py-12 text-white sm:px-8 lg:px-16">
            <div className="flex w-full max-w-md flex-1 flex-col">
              <h3 className="text-2xl font-bold">
                {C.name}
                <span className="ml-3 align-middle text-sm font-semibold text-calido-50">· el más elegido</span>
              </h3>
              <p className="mt-2 text-5xl font-bold">
                {formatEuros(C.priceCents)}
                <span className="text-lg font-medium text-calido-100">/mes</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-lg text-calido-50">
                <li>✓ Escribe hasta a {C.contactLimit} cuidadoras al mes</li>
                <li>✓ Reservas ilimitadas</li>
                <li>✓ Sin permanencia</li>
              </ul>
              <Link
                href="/register?role=FAMILIA"
                className="btn-primary mt-8 self-start bg-white text-calido-700 hover:bg-calido-50"
              >
                Empezar con Completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cuidadoras: qué tienen que hacer. */}
      <section id="cuidadoras" className="scroll-mt-4 bg-marino-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-24">
          <div>
            <p className="text-sm font-semibold text-salvia-300">Si eres cuidadora</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Encuentra familias en tu zona, gratis
            </h2>
            <p className="mt-4 text-lg text-salvia-100">
              Tú pones tu precio y tus horarios. No pagas cuota ni comisión.
            </p>
            <Link
              href="/register?role=CUIDADORA"
              className="btn-primary mt-8 bg-white text-base text-marino-800 hover:bg-salvia-50"
            >
              Registrarme gratis
            </Link>
          </div>
          <ol className="divide-y divide-white/15 border-y border-white/15">
            {CUIDADORA_PASOS.map((p) => (
              <li key={p.t} className="py-6 sm:grid sm:grid-cols-[15rem_1fr] sm:gap-8">
                <h3 className="text-xl font-bold">{p.t}</h3>
                <p className="mt-1 text-lg text-salvia-100 sm:mt-0">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Preguntas */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr] lg:gap-20 lg:py-24">
          <h2 className="text-3xl font-bold leading-tight text-marino-800 sm:text-4xl">
            Lo que más nos preguntan
          </h2>
          <div className="divide-y divide-marino-100 border-y border-marino-100">
            {PREGUNTAS.map((p) => (
              <details key={p.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-marino-800 [&::-webkit-details-marker]:hidden">
                  {p.q}
                  <span aria-hidden className="text-2xl font-normal text-calido-500 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-lg text-marino-600">{p.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Zonas: aquí se ven las cuidadoras reales de cada pueblo sin registrarse. */}
      <div id="zonas" className="scroll-mt-4 mx-auto max-w-5xl px-5 pb-16">
        <ZonasLinks
          titulo="Mira las cuidadoras de tu pueblo"
          texto="Sin registrarte: elige tu población y verás las cuidadoras que trabajan allí, con su tarifa y su disponibilidad."
        />
      </div>

      {/* Cierre: otra vez las dos puertas. */}
      <section className="grid md:grid-cols-2">
        <Link
          href="/register?role=FAMILIA"
          className="flex items-center justify-between gap-4 bg-calido-500 px-5 py-10 text-white sm:px-10 lg:px-16"
        >
          <span>
            <span className="block text-2xl font-bold sm:text-3xl">Busco cuidadora</span>
            <span className="mt-1 block text-calido-50">Crear cuenta de familia</span>
          </span>
          <Flecha />
        </Link>
        <Link
          href="/register?role=CUIDADORA"
          className="flex items-center justify-between gap-4 bg-marino-800 px-5 py-10 text-white sm:px-10 lg:px-16"
        >
          <span>
            <span className="block text-2xl font-bold sm:text-3xl">Soy cuidadora</span>
            <span className="mt-1 block text-salvia-100">Registrarme gratis</span>
          </span>
          <Flecha />
        </Link>
      </section>
    </main>
  );
}
