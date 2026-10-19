"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

// Barra de navegación inferior tipo app (móvil) + franja bajo la cabecera en escritorio.
export function BottomNav({ items, max = "max-w-4xl" }: { items: NavItem[]; max?: string }) {
  const pathname = usePathname();

  // La raíz del panel (p. ej. /familia) solo se marca en su propia página; si no,
  // quedaría encendida en todas las subpáginas a la vez que la de verdad.
  const raiz = items[0]?.href;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-marino-100 bg-white
        sm:static sm:border-b sm:border-t-0 sm:bg-marino-900"
    >
      <ul className={`mx-auto flex ${max} items-stretch justify-around sm:justify-start sm:gap-1 sm:px-4`}>
        {items.map((it) => {
          const active =
            pathname === it.href || (it.href !== raiz && pathname.startsWith(it.href + "/"));
          return (
            <li key={it.href} className="flex-1 sm:flex-none">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition
                  sm:flex-row sm:gap-2 sm:border-b-4 sm:px-4 sm:py-3 sm:text-base ${
                    active
                      ? "text-calido-600 sm:border-salvia-400 sm:text-white"
                      : "text-marino-400 hover:text-marino-600 sm:border-transparent sm:text-salvia-100 sm:hover:text-white"
                  }`}
              >
                <span className="text-xl sm:text-lg" aria-hidden>
                  {it.icon}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
