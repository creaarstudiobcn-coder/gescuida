import { requireRole } from "@/lib/auth-helpers";
import { DashboardShell } from "@/components/DashboardShell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const nav = [
    { href: "/admin", label: "Panel", icon: "📊" },
    { href: "/admin/turnos", label: "Turnos", icon: "🗂️" },
    { href: "/admin/cuidadoras", label: "Cuidadoras", icon: "🤝" },
  ];
  return (
    <DashboardShell title="Administración" userName={user.name ?? ""} nav={nav}>
      {children}
    </DashboardShell>
  );
}
