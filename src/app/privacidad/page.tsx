import type { Metadata } from "next";
import { LegalDraft } from "@/components/LegalDraft";

export const metadata: Metadata = {
  title: "Política de Privacidad — GesCuida",
  description: "Cómo trata GesCuida tus datos personales, conforme al RGPD y la LOPDGDD.",
};

// Prerenderizado estático: el .md se lee en build, no en runtime (seguro en producción).
export const dynamic = "force-static";

export default function PrivacidadPage() {
  return <LegalDraft file="politica-de-privacidad.md" />;
}
