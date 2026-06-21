import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendChatNotificationEmail } from "@/lib/email";
import { CHAT_COOKIE, isAdminOnline, adminEmails } from "@/lib/chat";

const COOKIE_MAX_AGE = 180 * 24 * 60 * 60; // 180 días

function serialize(messages: { id: string; body: string; fromAdmin: boolean; createdAt: Date }[]) {
  return messages.map((m) => ({
    id: m.id,
    body: m.body,
    fromAdmin: m.fromAdmin,
    createdAt: m.createdAt,
  }));
}

// GET /api/chat → hilo del visitante (identificado por su cookie) + estado del admin.
export async function GET() {
  const token = (await cookies()).get(CHAT_COOKIE)?.value;
  const session = await auth();
  const online = await isAdminOnline();

  if (token) {
    const chat = await prisma.chatSession.findUnique({
      where: { token },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (chat) {
      return NextResponse.json({
        online,
        needsContact: false,
        name: chat.visitorName,
        messages: serialize(chat.messages),
      });
    }
  }

  // Sin hilo todavía: si NO está logueado, le pediremos nombre + email antes de escribir.
  return NextResponse.json({
    online,
    needsContact: !session?.user,
    name: session?.user?.name ?? null,
    messages: [],
  });
}

const sendSchema = z.object({
  body: z.string().min(1).max(1000),
  name: z.string().max(120).optional(),
  email: z.string().email().max(160).optional(),
  recaptchaToken: z.string().optional(),
});

// POST /api/chat → el visitante envía un mensaje (crea la sesión la primera vez).
export async function POST(req: Request) {
  const parsed = sendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  const { body, name, email } = parsed.data;

  // Anti-bot/spam: reCAPTCHA v3. Si no está configurado, no bloquea.
  const rc = await verifyRecaptcha(parsed.data.recaptchaToken, "chat");
  if (!rc.ok) {
    return NextResponse.json(
      { error: "Verificación de seguridad fallida. Inténtalo de nuevo." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(CHAT_COOKIE)?.value;
  const session = await auth();
  const authUser = session?.user;

  // Localiza la sesión existente (por cookie) o prepárate para crear una nueva.
  let chat = token
    ? await prisma.chatSession.findUnique({ where: { token } })
    : null;

  let newToken: string | null = null;

  if (!chat) {
    // Para poder responderte cuando no estoy conectado necesito un email de contacto.
    const visitorName = authUser?.name ?? name?.trim() ?? null;
    const visitorEmail = authUser?.email ?? email?.trim() ?? null;
    if (!visitorEmail) {
      return NextResponse.json(
        { error: "Necesitamos tu email para poder responderte.", code: "EMAIL_REQUIRED" },
        { status: 400 }
      );
    }
    newToken = randomUUID();
    chat = await prisma.chatSession.create({
      data: {
        token: newToken,
        userId: authUser?.id ?? null,
        visitorName,
        visitorEmail,
      },
    });
  }

  // ¿Tenía el admin mensajes del visitante SIN leer antes de este? Para avisar solo una vez
  // por "ráfaga" y no spamear el email en cada mensaje.
  const pendingBefore = await prisma.chatMessage.count({
    where: {
      sessionId: chat.id,
      fromAdmin: false,
      createdAt: { gt: chat.adminReadAt ?? new Date(0) },
    },
  });

  await prisma.chatMessage.create({
    data: { sessionId: chat.id, fromAdmin: false, body },
  });
  await prisma.chatSession.update({
    where: { id: chat.id },
    data: { lastMessageAt: new Date() },
  });

  // Aviso por email al admin SOLO si no está conectado y no había mensajes pendientes.
  const online = await isAdminOnline();
  if (!online && pendingBefore === 0) {
    const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://gescuida.es";
    const preview = body.length > 200 ? `${body.slice(0, 200)}…` : body;
    const tos = await adminEmails();
    await Promise.all(
      tos.map((to) =>
        sendChatNotificationEmail(to, {
          visitorName: chat!.visitorName,
          visitorEmail: chat!.visitorEmail,
          preview,
          panelUrl: `${base}/gestion-9k2p7/chat`,
        })
      )
    );
  }

  const res = NextResponse.json({ ok: true, online }, { status: 201 });
  if (newToken) {
    const secure = (process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https");
    res.cookies.set(CHAT_COOKIE, newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }
  return res;
}
