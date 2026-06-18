import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renderiza un documento legal desde un archivo Markdown de la carpeta legal/.
// El texto se lee en build (las páginas son estáticas). Para actualizarlo, basta con
// editar el .md correspondiente.
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
      {readError ? (
        <p className="text-marino-600">
          No se ha podido cargar <code>legal/{file}</code>.
        </p>
      ) : (
        <article className="legal-doc space-y-3">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // En móvil, SOLO la tabla scrollea en horizontal (no arrastra el texto).
              table: (props) => (
                <div className="overflow-x-auto">
                  <table {...props} />
                </div>
              ),
            }}
          >
            {content}
          </Markdown>
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
