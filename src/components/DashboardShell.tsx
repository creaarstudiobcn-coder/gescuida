import { LogoutButton } from "./LogoutButton";
import { BottomNav, type NavItem } from "./BottomNav";

// `ancho`: el panel de gestión enseña tablas y rejillas y aprovecha toda la
// pantalla; los de familia y cuidadora son de lectura y se quedan más estrechos.
export function DashboardShell({
  title,
  userName,
  nav,
  ancho = false,
  children,
}: {
  title: string;
  userName: string;
  nav: NavItem[];
  ancho?: boolean;
  children: React.ReactNode;
}) {
  const max = ancho ? "max-w-7xl" : "max-w-4xl";
  return (
    <div className="min-h-dvh bg-crema-50">
      {/* Cabecera y menú van juntos en un bloque fijo arriba. Sin filtros en el
          envoltorio: un backdrop-filter rompería el `fixed` del menú en el móvil. */}
      <div className="sticky top-0 z-30">
        <header className="border-b border-marino-100 bg-white">
          <div className={`mx-auto flex ${max} items-center justify-between gap-3 px-4 py-3 sm:px-6`}>
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/gescuida-logo-horizontal.svg"
                alt="GesCuida"
                width={170}
                height={48}
                className="h-10 w-auto shrink-0 sm:h-12"
              />
              <span className="hidden rounded-full bg-salvia-50 px-3 py-1 text-sm font-semibold text-salvia-700 sm:inline">
                {title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-base font-semibold text-marino-700 md:inline">{userName}</span>
              <LogoutButton />
            </div>
          </div>
        </header>
        <BottomNav items={nav} max={max} />
      </div>

      <main className={`mx-auto ${max} px-4 pb-28 pt-6 sm:px-6 sm:pb-12`}>
        <p className="mb-4 text-sm font-semibold text-salvia-700 sm:hidden">{title}</p>
        {children}
      </main>
    </div>
  );
}
