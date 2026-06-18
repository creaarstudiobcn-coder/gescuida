import type { Metadata } from "next";
import { LegalDraft } from "@/components/LegalDraft";

// BORRADOR pendiente de validación legal — no enlazado, no indexable (review-only).
// Sustituye a la antigua página demo de privacidad. Cuando el abogado valide el texto,
// basta con editar legal/politica-de-privacidad.md y volver a enlazarla.
export const metadata: Metadata = {
  title: "[BORRADOR] Política de Privacidad — GesCuida",
  robots: { index: false, follow: false },
};

export default function PrivacidadPage() {
  return <LegalDraft file="politica-de-privacidad.md" />;
}
