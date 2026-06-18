import type { Metadata } from "next";
import { LegalDraft } from "@/components/LegalDraft";

// BORRADOR pendiente de validación legal — no enlazado, no indexable (review-only).
export const metadata: Metadata = {
  title: "[BORRADOR] Términos y Condiciones — GesCuida",
  robots: { index: false, follow: false },
};

export default function TerminosPage() {
  return <LegalDraft file="terminos-y-condiciones.md" />;
}
