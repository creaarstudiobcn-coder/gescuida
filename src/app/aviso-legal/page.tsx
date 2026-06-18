import type { Metadata } from "next";
import { LegalDraft } from "@/components/LegalDraft";

// BORRADOR pendiente de validación legal — no enlazado, no indexable (review-only).
export const metadata: Metadata = {
  title: "[BORRADOR] Aviso Legal — GesCuida",
  robots: { index: false, follow: false },
};

export default function AvisoLegalPage() {
  return <LegalDraft file="aviso-legal.md" />;
}
