"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

// Barra de navegación inferior tipo app (móvil) + lateral simple en escritorio.
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-marino-100 bg-white/95 backdrop-blur
        sm:sticky sm:top-0 sm:bottom-auto sm:mx-auto sm:max-w-2xl sm:rounded-b-2xl sm:border-t-0"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition ${
                  active ? "text-calido-600" : "text-marino-400 hover:text-marino-600"
                }`}
              >
                <span className="text-xl" aria-hidden>
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
