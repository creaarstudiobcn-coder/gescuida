import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { assertSupabase, AVATARS_BUCKET } from "@/lib/supabase";

// Tipos de imagen permitidos → extensión del archivo en Storage.
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// POST /api/cuidadora/avatar → sube la foto de perfil de la cuidadora autenticada al bucket
// público `avatares` y devuelve su URL pública. Nombre único por cuidadora (su userId), así
// no se pisan entre ellas y re-subir sustituye la suya. La URL se persiste luego en el perfil.
export async function POST(req: Request) {
  const { user, res } = await apiAuth("CUIDADORA");
  if (res) return res;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se ha recibido ninguna imagen" }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Formato no válido. Usa una imagen JPG, PNG o WEBP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen es demasiado grande (máximo 5 MB)." },
      { status: 400 }
    );
  }

  const path = `${user.id}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  let storage;
  try {
    storage = assertSupabase().storage.from(AVATARS_BUCKET);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const { error: uploadError } = await storage.upload(path, bytes, {
    contentType: file.type,
    upsert: true, // re-subir reemplaza la foto anterior de esta cuidadora
  });
  if (uploadError) {
    return NextResponse.json(
      { error: `No se pudo subir la imagen: ${uploadError.message}` },
      { status: 502 }
    );
  }

  // URL pública + sufijo de versión para evitar caché del navegador/CDN al cambiar la foto.
  const { data } = storage.getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;

  return NextResponse.json({ url });
}
