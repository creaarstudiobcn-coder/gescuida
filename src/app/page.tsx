import Link from "next/link";
import { ACCESS_PLANS, formatEuros } from "@/lib/pricing";
import { ZonasLinks } from "@/components/ZonasLinks";
import { CuidadorasProceso } from "@/components/CuidadorasProceso";

const PASOS = [
  {
    n: "1",
    icon: "💳",
    t: "Elige tu plan",
    d: "Suscríbete para acceder a la plataforma y a las cuidadoras de tu zona.",
  },
  {
    n: "2",
    icon: "📅",
    t: "Reserva una visita",
    d: "Indica día y hora; las cuidadoras cercanas la aceptan.",
  },
  {
    n: "3",
    icon: "💬",
    t: "Contacta y acuerda",
    d: "Habláis por el chat, ves su tarifa y acordáis el cuidado.",
  },
  {
    n: "4",
    icon: "🏠",
    t: "Cuidado en casa",
    d: "La cuidadora acude al domicilio; el pago del cuidado es entre vosotros.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-20">
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

      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-marino-800 to-calido-600 px-6 py-14 text-center text-white shadow-lg">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Encuentra cuidadora de confianza en Mataró y el Maresme
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-salvia-50">
          Te conectamos con cuidadoras profesionales e independientes. Tú eliges, contactas y
          acuerdas el cuidado directamente con ellas.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
      </section>

      {/* Aviso destacado: plataforma de conexión, no agencia */}
      <section className="mt-8">
        <div className="rounded-2xl border-2 border-salvia-300 bg-salvia-50 p-5 sm:p-6">
          <p className="flex items-start gap-3 text-marino-800">
            <span className="mt-0.5 text-2xl" aria-hidden>
              ℹ️
            </span>
            <span className="text-base sm:text-lg">
              <strong>Somos una plataforma de conexión, no una agencia.</strong> Tu cuota mensual es
              por usar la plataforma y encontrar cuidadoras. <strong>El precio del cuidado lo pone
              cada cuidadora</strong> y lo acuerdas directamente con ella. No empleamos a las
              cuidadoras: son profesionales independientes.
            </span>
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-marino-800">Cómo funciona</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p) => (
            <div key={p.n} className="card text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-salvia-100 text-lg font-extrabold text-marino-800">
                {p.n}
              </div>
              <div className="mt-3 text-3xl" aria-hidden>
                {p.icon}
              </div>
              <h3 className="mt-2 text-lg font-bold text-marino-800">{p.t}</h3>
              <p className="mt-2 text-marino-600">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planes */}
      <section className="mt-16" id="planes">
        <h2 className="text-center text-2xl font-bold text-marino-800">
          Elige tu plan de acceso
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-marino-600">
          Es una cuota por <strong>usar la plataforma</strong> y contactar con cuidadoras.{" "}
          <strong>No incluye el precio del cuidado</strong>, que lo fija cada cuidadora y abonas
          directamente con ella.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {/* Básico */}
          <div className="card flex flex-col">
            <h3 className="text-xl font-extrabold text-marino-800">{ACCESS_PLANS.BASICO.name}</h3>
            <p className="mt-1 text-4xl font-extrabold text-marino-700">
              {formatEuros(ACCESS_PLANS.BASICO.priceCents)}
              <span className="text-base font-medium text-marino-400">/mes</span>
            </p>
            <ul className="mt-4 flex-1 space-y-1.5 text-marino-600">
              <li>✓ Contacta hasta {ACCESS_PLANS.BASICO.contactLimit} cuidadoras</li>
              <li>✓ Reservas ilimitadas</li>
              <li>✓ Sin permanencia</li>
            </ul>
            <Link href="/register?role=FAMILIA" className="btn-secondary mt-5">
              Empezar con Básico
            </Link>
          </div>

          {/* Completo (destacado) */}
          <div className="card flex flex-col ring-2 ring-calido-400">
            <span className="badge mb-2 self-start bg-calido-100 text-calido-700">Más elegido</span>
            <h3 className="text-xl font-extrabold text-marino-800">{ACCESS_PLANS.COMPLETO.name}</h3>
            <p className="mt-1 text-4xl font-extrabold text-marino-700">
              {formatEuros(ACCESS_PLANS.COMPLETO.priceCents)}
              <span className="text-base font-medium text-marino-400">/mes</span>
            </p>
            <ul className="mt-4 flex-1 space-y-1.5 text-marino-600">
              <li>✓ Contacta hasta {ACCESS_PLANS.COMPLETO.contactLimit} cuidadoras</li>
              <li>✓ Reservas ilimitadas</li>
              <li>✓ Sin permanencia</li>
            </ul>
            <Link href="/register?role=FAMILIA" className="btn-primary mt-5">
              Elegir Completo
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-marino-500">
          La cuota es por el uso de la plataforma de conexión. El cuidado se acuerda y se paga
          directamente entre familia y cuidadora.
        </p>
      </section>

      {/* Cuidadoras — proceso de conexión animado */}
      <CuidadorasProceso />

      {/* Zonas donde operamos (SEO local + enlaces internos) */}
      <ZonasLinks />
    </main>
  );
}
