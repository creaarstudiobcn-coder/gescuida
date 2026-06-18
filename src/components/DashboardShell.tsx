import { LogoutButton } from "./LogoutButton";
import { BottomNav, type NavItem } from "./BottomNav";

export function DashboardShell({
  title,
  userName,
  nav,
  children,
}: {
  title: string;
  userName: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-crema-50">
      <header className="sticky top-0 z-20 border-b border-marino-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-salvia-600">{title}</p>
            <p className="font-bold text-marino-800">🌊 Cuidado Mataró</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-marino-500 sm:inline">{userName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-28 pt-4 sm:pb-10">{children}</main>

      <BottomNav items={nav} />
    </div>
  );
}
