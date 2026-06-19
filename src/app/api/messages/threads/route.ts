import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// GET /api/messages/threads → lista de conversaciones DIRECTAS (sin turno) del usuario.
// Pensado para la bandeja "Mensajes" de la cuidadora (de momento, soporte/admin).
export async function GET() {
  const { user, res } = await apiAuth();
  if (res) return res;

  const messages = await prisma.message.findMany({
    where: {
      shiftId: null,
      OR: [{ senderUserId: user.id }, { recipientUserId: user.id }],
    },
    include: {
      sender: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Agrupar por el "otro" participante. Como vienen ordenados por fecha desc,
  // el primer mensaje de cada par es el más reciente.
  const threads = new Map<
    string,
    { userId: string; name: string; lastBody: string; lastAt: Date; unread: number }
  >();

  for (const m of messages) {
    const iAmSender = m.senderUserId === user.id;
    const other = iAmSender ? m.recipient : m.sender;
    const existing = threads.get(other.id);
    const isUnreadForMe = !iAmSender && m.readAt === null;

    if (!existing) {
      threads.set(other.id, {
        userId: other.id,
        name: other.name,
        lastBody: m.body,
        lastAt: m.createdAt,
        unread: isUnreadForMe ? 1 : 0,
      });
    } else if (isUnreadForMe) {
      existing.unread += 1;
    }
  }

  return NextResponse.json(Array.from(threads.values()));
}
