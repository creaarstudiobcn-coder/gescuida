import Link from "next/link";
import { ACCESS_PLANS, formatEuros } from "@/lib/pricing";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-20">
      {/* Cabecera */}
      <header className="flex items-center justify-between py-5">
        <span className="text-xl font-extrabold text-marino-700">
          🌊 Cuidado Mataró
        </span>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">
            Entrar
          </Link>
          <Link href="/register" className="btn-primary">
            Empezar
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-marino-600 to-salvia-600 px-6 py-14 text-center text-white shadow-lg">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Conecta con cuidadoras de confianza en el Maresme
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-marino-50">
          La plataforma que pone en contacto a familias y cuidadoras de personas mayores en
          Mataró y el Maresme. Tú encuentras y coordinas las visitas; la cuidadora las acepta
          libremente. <strong>Cuidadoras: gratis. Familias: elige tu plan de acceso desde{" "}
          {formatEuros(ACCESS_PLANS.BASICO.priceCents)}/mes.</strong>
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-marino-100">
          Somos una plataforma de conexión: no empleamos a las cuidadoras ni prestamos el
          cuidado. El servicio se acuerda y se paga directamente entre familia y cuidadora.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register?role=FAMILIA" className="btn-primary text-lg">
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

      {/* Cómo funciona */}
      <section className="mt-14">
        <h2 className="text-center text-2xl font-bold text-marino-800">Cómo funciona</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: "📅",
              t: "1. Reservas",
              d: "Con tu acceso activo, eliges día y franja en el calendario. Sin límite de horas.",
            },
            {
              icon: "🤝",
              t: "2. Una cuidadora acepta",
              d: "Las cuidadoras cercanas ven el turno y lo aceptan libremente. Recibes su nombre al confirmarse.",
            },
            {
              icon: "👀",
              t: "3. Lo ves en tiempo real",
              d: "Sigues el estado de cada visita: buscando, confirmada o completada. Y puedes mensajearte.",
            },
          ].map((s) => (
            <div key={s.t} className="card text-center">
              <div className="text-4xl" aria-hidden>
                {s.icon}
              </div>
              <h3 className="mt-3 text-lg font-bold text-marino-800">{s.t}</h3>
              <p className="mt-2 text-marino-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Precios: cuota de acceso (familias) + gratis (cuidadoras) */}
      <section className="mt-16" id="precios">
        <h2 className="text-center text-2xl font-bold text-marino-800">
          Precios claros y honestos
        </h2>
        <p className="mt-2 text-center text-marino-600">
          Una sola cuota de acceso para familias. Para cuidadoras, siempre gratis.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {/* Familias · Plan Básico */}
          <div className="card flex flex-col">
            <span className="badge mb-2 self-start bg-calido-100 text-calido-700">Familias</span>
            <h3 className="text-xl font-extrabold text-marino-800">{ACCESS_PLANS.BASICO.name}</h3>
            <p className="mt-1 text-4xl font-extrabold text-marino-700">
              {formatEuros(ACCESS_PLANS.BASICO.priceCents)}
              <span className="text-base font-medium text-marino-400">/mes</span>
            </p>
            <p className="mt-1 font-semibold text-salvia-600">
              Hasta {ACCESS_PLANS.BASICO.contactLimit} cuidadoras/mes
            </p>
            <ul className="mt-4 flex-1 space-y-1 text-sm text-marino-600">
              <li>✓ Reservar y coordinar visitas, sin límite de horas</li>
              <li>✓ Mensajería y seguimiento en tiempo real</li>
            </ul>
            <Link href="/register?role=FAMILIA" className="btn-secondary mt-5">
              Empezar con Básico
            </Link>
          </div>

          {/* Familias · Plan Completo */}
          <div className="card flex flex-col ring-2 ring-calido-400">
            <span className="badge mb-2 self-start bg-calido-100 text-calido-700">
              Familias · recomendado
            </span>
            <h3 className="text-xl font-extrabold text-marino-800">{ACCESS_PLANS.COMPLETO.name}</h3>
            <p className="mt-1 text-4xl font-extrabold text-marino-700">
              {formatEuros(ACCESS_PLANS.COMPLETO.priceCents)}
              <span className="text-base font-medium text-marino-400">/mes</span>
            </p>
            <p className="mt-1 font-semibold text-salvia-600">
              Hasta {ACCESS_PLANS.COMPLETO.contactLimit} cuidadoras/mes
            </p>
            <ul className="mt-4 flex-1 space-y-1 text-sm text-marino-600">
              <li>✓ Todo lo del plan Básico</li>
              <li>✓ Mucho más margen para encontrar a tu cuidadora ideal</li>
            </ul>
            <Link href="/register?role=FAMILIA" className="btn-primary mt-5">
              Elegir Completo
            </Link>
          </div>

          {/* Cuidadoras */}
          <div className="card flex flex-col ring-2 ring-salvia-300">
            <span className="badge mb-2 self-start bg-salvia-100 text-salvia-700">Cuidadoras</span>
            <h3 className="text-xl font-extrabold text-marino-800">Registro gratuito</h3>
            <p className="mt-1 text-4xl font-extrabold text-salvia-700">
              0 €<span className="text-base font-medium text-marino-400">/mes</span>
            </p>
            <p className="mt-1 font-semibold text-salvia-600">Sin límite de clientes</p>
            <ul className="mt-4 flex-1 space-y-1 text-sm text-marino-600">
              <li>✓ Crea tu perfil y acepta turnos libremente</li>
              <li>✓ Sin cuotas ni comisiones</li>
              <li>✓ Cobras tu tarifa directamente de la familia</li>
            </ul>
            <Link
              href="/register?role=CUIDADORA"
              className="btn-secondary mt-5 border-salvia-400 text-salvia-700"
            >
              Soy cuidadora
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-marino-500">
          Cada cuidadora fija libremente su tarifa por hora, y el importe del cuidado se acuerda y
          se paga directamente entre familia y cuidadora. La plataforma no fija ni cobra ese importe.
        </p>
      </section>

      <footer className="mt-16 border-t border-marino-100 pt-6 text-center text-sm text-marino-500">
        <p>GesCuida · Mataró i el Maresme</p>
        <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/terminos" className="underline hover:text-marino-700">
            Términos y Condiciones
          </Link>
          <Link href="/privacidad" className="underline hover:text-marino-700">
            Política de Privacidad
          </Link>
          <Link href="/aviso-legal" className="underline hover:text-marino-700">
            Aviso Legal
          </Link>
        </nav>
      </footer>
    </main>
  );
}
