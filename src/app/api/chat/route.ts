import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site-url";
import { cookies, headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendChatNotificationEmail } from "@/lib/email";
import { CHAT_COOKIE, isAdminOnline, adminEmails } from "@/lib/chat";
import {
  classifyChatMessage,
  FLOOD_MAX_MESSAGES,
  FLOOD_WINDOW_MS,
  NEW_SESSIONS_PER_IP,
  NEW_SESSIONS_WINDOW_MS,
} from "@/lib/chat-antispam";

const COOKIE_MAX_AGE = 180 * 24 * 60 * 60; // 180 días

// Conversaciones nuevas abiertas por cada IP, para frenar al que abre hilos en serie.
// Vive en memoria del proceso: en serverless es "lo que se pueda", pero una ráfaga
// suele caer en la misma instancia caliente, que es justo lo que queremos cortar.
const nuevasPorIp = new Map<string, number[]>();

function ipDe(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "desconocida"
  );
}

// ¿Esta IP ha abierto ya demasiadas conversaciones nuevas en la última hora?
function demasiadasSesionesNuevas(ip: string): boolean {
  const ahora = Date.now();
  const previas = (nuevasPorIp.get(ip) ?? []).filter((t) => ahora - t < NEW_SESSIONS_WINDOW_MS);
  if (previas.length >= NEW_SESSIONS_PER_IP) {
    nuevasPorIp.set(ip, previas);
    return true;
  }
  previas.push(ahora);
  nuevasPorIp.set(ip, previas);
  if (nuevasPorIp.size > 5000) nuevasPorIp.clear(); // techo de memoria
  return false;
}

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
  // Cebo: campo oculto que ningún humano ve ni rellena. Si viene con algo, es un bot.
  website: z.string().max(200).optional(),
});

// POST /api/chat → el visitante envía un mensaje (crea la sesión la primera vez).
export async function POST(req: Request) {
  const parsed = sendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  const { body, name, email } = parsed.data;

  // ── Cebo (honeypot) ──
  // Le devolvemos un "ok" para que el bot se dé por satisfecho y no reintente,
  // pero no guardamos nada ni avisamos a nadie.
  if (parsed.data.website?.trim()) {
    console.warn("[chat] descartado por honeypot");
    return NextResponse.json({ ok: true, online: false }, { status: 201 });
  }

  // Anti-bot/spam: reCAPTCHA v3. Si no está configurado, no bloquea.
  const rc = await verifyRecaptcha(parsed.data.recaptchaToken, "chat");
  if (!rc.ok) {
    return NextResponse.json(
      { error: "Verificación de seguridad fallida. Inténtalo de nuevo." },
      { status: 400 }
    );
  }
  // Aunque no bloquee (modo monitor), una puntuación baja sí basta para NO dar la
  // tabarra por email: el mensaje se guarda y se ve en el panel.
  const recaptchaSospechoso = rc.reason === "low_score" || rc.reason === "action_mismatch";

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
    // Freno a quien abre conversaciones en serie desde la misma IP.
    if (!authUser && demasiadasSesionesNuevas(ipDe(await headers()))) {
      return NextResponse.json(
        {
          error: "Has abierto varias conversaciones seguidas. Espera un rato o escríbenos por email.",
          code: "RATE_LIMIT",
        },
        { status: 429 }
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
  } else {
    // Freno a la ráfaga dentro de un hilo que ya existe. Su historial no se pierde:
    // solo le pedimos que baje el ritmo.
    const recientes = await prisma.chatMessage.count({
      where: {
        sessionId: chat.id,
        fromAdmin: false,
        createdAt: { gt: new Date(Date.now() - FLOOD_WINDOW_MS) },
      },
    });
    if (recientes >= FLOOD_MAX_MESSAGES) {
      return NextResponse.json(
        {
          error: "Has enviado muchos mensajes seguidos. Espera unos minutos y seguimos.",
          code: "RATE_LIMIT",
        },
        { status: 429 }
      );
    }
  }

  // ── Criba de spam ──
  // Nunca decide si el mensaje se guarda (se guarda siempre), solo si merece un email.
  const veredicto = classifyChatMessage(body, {
    name: chat.visitorName,
    email: chat.visitorEmail,
  });

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

  // Aviso por email al admin SOLO si no está conectado, no había mensajes pendientes,
  // el hilo no está silenciado y el mensaje no huele a spam.
  const online = await isAdminOnline();
  const silenciado = chat.blocked || veredicto.spam || recaptchaSospechoso;
  if (silenciado) {
    console.warn(
      `[chat] sin aviso por email: bloqueado=${chat.blocked} spam=${veredicto.spam} ` +
        `score=${veredicto.score} recaptcha=${rc.reason ?? "ok"} motivos=${veredicto.reasons.join("|")}`
    );
  }
  if (!online && pendingBefore === 0 && !silenciado) {
    const base = SITE_URL;
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
    const secure = SITE_URL.startsWith("https");
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
