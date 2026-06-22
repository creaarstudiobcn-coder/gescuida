import Link from "next/link";

// Footer global de GesCuida. Antes estaba duplicado inline en page.tsx y en
// cuidadoras/[pueblo]/page.tsx; ahora vive aquí una sola vez.

// Iconos en SVG inline (el proyecto no usa librería de iconos: ver GoogleButton.tsx).
// fill="currentColor" para heredar el verde de marca desde las clases de Tailwind.
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.899 1.382 3.744 3.744 0 0 1-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899 3.644 3.644 0 0 1-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  );
}

export function Footer() {
  return (
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

      {/* Síguenos — verdes de marca, no colores corporativos de FB/IG */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-salvia-200/80">Síguenos</p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://www.facebook.com/profile.php?id=61591223880736"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Síguenos en Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-marino-800 text-salvia-400 transition-colors hover:bg-calido-500 hover:text-white"
          >
            <FacebookIcon />
          </a>
          <a
            href="https://www.instagram.com/gescuida/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Síguenos en Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-marino-800 text-salvia-400 transition-colors hover:bg-calido-500 hover:text-white"
          >
            <InstagramIcon />
          </a>
        </div>
      </div>

      <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
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
  );
}
