import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { touchAdminPresence } from "@/lib/chat";

// POST /api/chat/heartbeat → el panel de chat avisa de que el admin sigue presente.
// Mientras se llama (cada ~30 s), el widget del visitante muestra al admin "en línea".
export async function POST() {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;
  await touchAdminPresence();
  return NextResponse.json({ ok: true });
}
