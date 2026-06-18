import type { Metadata } from "next";
import { LegalDraft } from "@/components/LegalDraft";

export const metadata: Metadata = {
  title: "Términos y Condiciones — GesCuida",
  description: "Términos y condiciones de uso de la plataforma de intermediación GesCuida.",
};

// Prerenderizado estático: el .md se lee en build, no en runtime (seguro en producción).
export const dynamic = "force-static";

export default function TerminosPage() {
  return <LegalDraft file="terminos-y-condiciones.md" />;
}
