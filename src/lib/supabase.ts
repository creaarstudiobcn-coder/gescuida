import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de Supabase para el SERVIDOR (Storage). Usa la clave service_role, que salta las
// RLS: NUNCA debe exponerse al navegador ni marcarse como NEXT_PUBLIC. Solo se usa en rutas
// de API server-side. Si faltan las variables, las rutas devolverán un error claro.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export const supabase: SupabaseClient | null =
  url && serviceKey
    ? createClient(url, serviceKey, { auth: { persistSession: false } })
    : null;

export function assertSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase Storage no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return supabase;
}

// Bucket público donde se guardan las fotos de perfil de las cuidadoras.
export const AVATARS_BUCKET = "avatares";
