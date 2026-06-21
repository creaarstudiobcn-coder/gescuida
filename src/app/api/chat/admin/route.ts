import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// GET /api/chat/admin              → lista de conversaciones (con nº sin leer).
// GET /api/chat/admin?sessionId=X  → hilo completo de una conversación (la marca como leída).
export async function GET(req: Request) {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const sessionId = new URL(req.url).searchParams.get("sessionId");

  // ── Hilo de una conversación ──
  if (sessionId) {
    const chat = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!chat) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    // Al abrirla, marcamos como leída (resetea el badge y el "email-una-vez").
    await prisma.chatSession.update({
      where: { id: chat.id },
      data: { adminReadAt: new Date() },
    });

    return NextResponse.json({
      id: chat.id,
      name: chat.visitorName,
      email: chat.visitorEmail,
      messages: chat.messages.map((m) => ({
        id: m.id,
        body: m.body,
        fromAdmin: m.fromAdmin,
        createdAt: m.createdAt,
      })),
    });
  }

  // ── Lista de conversaciones ──
  const sessions = await prisma.chatSession.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const list = await Promise.all(
    sessions.map(async (s) => {
      const unread = await prisma.chatMessage.count({
        where: {
          sessionId: s.id,
          fromAdmin: false,
          createdAt: { gt: s.adminReadAt ?? new Date(0) },
        },
      });
      const last = s.messages[0];
      return {
        id: s.id,
        name: s.visitorName,
        email: s.visitorEmail,
        lastBody: last?.body ?? "",
        lastAt: s.lastMessageAt,
        unread,
      };
    })
  );

  return NextResponse.json(list);
}

const replySchema = z.object({
  sessionId: z.string().min(1),
  body: z.string().min(1).max(1000),
});

// POST /api/chat/admin → el admin responde a una conversación.
export async function POST(req: Request) {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const parsed = replySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  const { sessionId, body } = parsed.data;

  const chat = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!chat) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  await prisma.chatMessage.create({
    data: { sessionId: chat.id, fromAdmin: true, body },
  });
  await prisma.chatSession.update({
    where: { id: chat.id },
    data: { lastMessageAt: new Date(), adminReadAt: new Date() },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
