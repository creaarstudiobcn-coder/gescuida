import type { Metadata } from "next";
import { LegalDraft } from "@/components/LegalDraft";

// BORRADOR pendiente de validación legal — no enlazado, no indexable (review-only).
export const metadata: Metadata = {
  title: "[BORRADOR] Aviso Legal — GesCuida",
  robots: { index: false, follow: false },
};

// Prerenderizado estático: el .md se lee en build, no en runtime (seguro en producción).
export const dynamic = "force-static";

export default function AvisoLegalPage() {
  return <LegalDraft file="aviso-legal.md" />;
}
