import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";

// Helper para Route Handlers: obtiene el usuario y comprueba el rol.
// Devuelve { user } o { res } con la respuesta de error lista para devolver.
export async function apiAuth(role?: Role) {
  const session = await auth();
  if (!session?.user) {
    return { res: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  if (role && session.user.role !== role) {
    return { res: NextResponse.json({ error: "Sin permiso" }, { status: 403 }) };
  }
  return { user: session.user };
}
