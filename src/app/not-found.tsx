import type { Metadata } from "next";
import Link from "next/link";

/* 404 de todo el sitio. El pie lo pone el layout raíz (SiteFooter); la cabecera
   va en cada página, así que se repite aquí igual que en la portada. Next la
   sirve con código 404. */
export const metadata: Metadata = {
  title: "Página no encontrada · GesCuida",
  robots: { index: false, follow: true },
};

const ENLACES = [
  { href: "/register?role=FAMILIA", label: "Soy una familia" },
  { href: "/register?role=CUIDADORA", label: "Soy cuidadora" },
  { href: "/cuidadoras/mataro", label: "Cuidadoras en Mataró" },
  { href: "/cuidadoras/barcelona", label: "Cuidadoras en Barcelona" },
  { href: "/login", label: "Entrar en mi cuenta" },
];

export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-20">
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

      <section className="mt-6 rounded-3xl bg-gradient-to-br from-marino-800 to-calido-600 px-6 py-14 text-center text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-salvia-50">Error 404</p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Esta página no existe
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-salvia-50">
          Puede que el enlace esté mal escrito o que la página ya no exista. Desde la portada
          puedes buscar cuidadora en tu municipio.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/" className="btn-primary bg-white text-marino-800 hover:bg-salvia-50 text-lg">
            Volver a la portada
          </Link>
        </div>
      </section>

      <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
        {ENLACES.map((enlace) => (
          <li key={enlace.href}>
            <Link
              href={enlace.href}
              className="inline-flex rounded-full border border-marino-200 bg-white px-4 py-2 text-sm font-semibold text-marino-700 transition hover:border-calido-400 hover:bg-calido-50 hover:text-calido-700"
            >
              {enlace.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
