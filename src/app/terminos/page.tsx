import type { Metadata } from "next";
import { LegalDraft } from "@/components/LegalDraft";

// BORRADOR pendiente de validación legal — no enlazado, no indexable (review-only).
export const metadata: Metadata = {
  title: "[BORRADOR] Términos y Condiciones — GesCuida",
  robots: { index: false, follow: false },
};

// Prerenderizado estático: el .md se lee en build, no en runtime (seguro en producción).
export const dynamic = "force-static";

export default function TerminosPage() {
  return <LegalDraft file="terminos-y-condiciones.md" />;
}
