import { requireRole } from "@/lib/auth-helpers";
import { DashboardShell } from "@/components/DashboardShell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("FAMILIA");
  const nav = [
    { href: "/familia", label: "Inicio", icon: "🏠" },
    { href: "/familia/reservar", label: "Reservar", icon: "📅" },
    { href: "/familia/visitas", label: "Visitas", icon: "🗓️" },
    { href: "/familia/personas", label: "Personas", icon: "👵" },
    { href: "/familia/suscripcion", label: "Acceso", icon: "💳" },
  ];
  return (
    <DashboardShell title="Panel de familia" userName={user.name ?? ""} nav={nav}>
      {children}
    </DashboardShell>
  );
}
