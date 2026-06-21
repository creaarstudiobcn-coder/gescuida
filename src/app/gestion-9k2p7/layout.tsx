import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-helpers";
import { DashboardShell } from "@/components/DashboardShell";

// El panel de gestión NUNCA debe indexarse ni seguirse.
export const metadata: Metadata = {
  title: "Gestión — GesCuida",
  robots: { index: false, follow: false, nocache: true },
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const nav = [
    { href: "/gestion-9k2p7", label: "Panel", icon: "📊" },
    { href: "/gestion-9k2p7/turnos", label: "Turnos", icon: "🗂️" },
    { href: "/gestion-9k2p7/cuidadoras", label: "Cuidadoras", icon: "🤝" },
    { href: "/gestion-9k2p7/chat", label: "Chat", icon: "💬" },
  ];
  return (
    <DashboardShell title="Administración" userName={user.name ?? ""} nav={nav}>
      {children}
    </DashboardShell>
  );
}
