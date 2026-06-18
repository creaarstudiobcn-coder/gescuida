import type { Metadata } from "next";
import { LegalDraft } from "@/components/LegalDraft";

export const metadata: Metadata = {
  title: "Aviso Legal — GesCuida",
  description: "Aviso legal e información del titular de la plataforma GesCuida (LSSI-CE).",
};

// Prerenderizado estático: el .md se lee en build, no en runtime (seguro en producción).
export const dynamic = "force-static";

export default function AvisoLegalPage() {
  return <LegalDraft file="aviso-legal.md" />;
}
