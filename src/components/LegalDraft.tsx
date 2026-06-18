import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renderiza un borrador legal desde un archivo Markdown de la carpeta legal/.
// IMPORTANTE: estas páginas son SOLO PARA REVISIÓN. No están enlazadas desde el
// footer ni el registro y llevan `robots: noindex`. Cuando el abogado valide el
// texto, basta con sustituir el contenido del .md correspondiente.
export function LegalDraft({ file }: { file: string }) {
  let content = "";
  let readError = false;
  try {
    content = fs.readFileSync(path.join(process.cwd(), "legal", file), "utf8");
  } catch {
    readError = true;
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      {/* Banner de borrador — siempre visible, independiente del contenido del .md */}
      <div
        className="mb-6 rounded-xl border-2 border-calido-400 bg-calido-50 p-4 text-sm text-calido-800"
        role="alert"
      >
        <p className="font-bold">⚠️ BORRADOR — pendiente de validación legal</p>
        <p className="mt-1">
          Documento <strong>no publicado</strong>, accesible solo para revisión. No constituye la
          versión definitiva ni asesoramiento jurídico. Debe ser revisado y validado por un
          abogado/a colegiado/a antes de su publicación.
        </p>
        <p className="mt-1 text-xs text-calido-700">
          Origen del texto: <code>legal/{file}</code>
        </p>
      </div>

      {readError ? (
        <p className="text-marino-600">
          No se ha podido cargar <code>legal/{file}</code>.
        </p>
      ) : (
        <article className="legal-doc space-y-3 overflow-x-auto">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </article>
      )}

      <p className="mt-10 text-center text-xs text-marino-400">
        <Link href="/" className="underline">
          ← Volver al inicio
        </Link>
      </p>
    </main>
  );
}
