import { requireRole } from "@/lib/auth-helpers";
import { DashboardShell } from "@/components/DashboardShell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("CUIDADORA");
  const nav = [
    { href: "/cuidadora", label: "Turnos", icon: "🔍" },
    { href: "/cuidadora/agenda", label: "Agenda", icon: "🗓️" },
    { href: "/cuidadora/ganancias", label: "Ingresos", icon: "💶" },
    { href: "/cuidadora/perfil", label: "Perfil", icon: "👤" },
  ];
  return (
    <DashboardShell title="Panel de cuidadora" userName={user.name ?? ""} nav={nav}>
      {children}
    </DashboardShell>
  );
}
