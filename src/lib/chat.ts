import { prisma } from "@/lib/prisma";

// Utilidades compartidas del chat de soporte de la web.

// Nombre de la cookie httpOnly de 1ª parte que identifica la sesión del visitante.
export const CHAT_COOKIE = "gescuida_chat";

// El admin se considera "en línea" si refrescó su presencia hace menos de esto.
// El panel manda un latido cada 30 s, así que 75 s deja margen para una pulsación perdida.
export const ONLINE_WINDOW_MS = 75_000;

// Id fijo de la fila única de presencia del admin.
const PRESENCE_ID = "admin";

// Refresca la marca de presencia del admin (lo llama el latido del panel de chat).
export async function touchAdminPresence(): Promise<void> {
  await prisma.adminPresence.upsert({
    where: { id: PRESENCE_ID },
    update: {}, // @updatedAt pone lastSeenAt = ahora
    create: { id: PRESENCE_ID },
  });
}

// ¿Hay algún admin con el panel de chat abierto ahora mismo?
export async function isAdminOnline(): Promise<boolean> {
  const p = await prisma.adminPresence.findUnique({ where: { id: PRESENCE_ID } });
  if (!p) return false;
  return Date.now() - p.lastSeenAt.getTime() < ONLINE_WINDOW_MS;
}

// Emails de todos los administradores (para avisarles de mensajes nuevos).
export async function adminEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  return admins.map((a) => a.email).filter(Boolean);
}
