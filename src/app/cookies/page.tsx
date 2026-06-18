import type { Metadata } from "next";
import { LegalDraft } from "@/components/LegalDraft";

export const metadata: Metadata = {
  title: "Política de Cookies — GesCuida",
  description: "Qué cookies usa GesCuida y cómo gestionar tu consentimiento (RGPD y LSSI).",
};

// Prerenderizado estático: el .md se lee en build, no en runtime.
export const dynamic = "force-static";

export default function CookiesPage() {
  return <LegalDraft file="politica-de-cookies.md" />;
}
