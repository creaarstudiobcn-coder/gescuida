import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getAccessStatus } from "@/lib/access";
import { canContactCaregiver } from "@/lib/contacts";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendNewMessageEmail } from "@/lib/email";

// Comprueba que el usuario participa en el turno (familia dueña o cuidadora asignada).
async function canAccessShift(shiftId: string, userId: string, role: string) {
  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shift) return null;
  if (role === "ADMIN") return shift;
  if (role === "FAMILIA" && shift.familyUserId === userId) return shift;
  if (role === "CUIDADORA" && shift.caregiverUserId === userId) return shift;
  return null;
}

// Conversación DIRECTA (sin turno): solo permitida entre un ADMIN y un no-admin.
// Devuelve el "otro" usuario si el par es válido, o null si no procede.
async function resolveDirectPeer(otherUserId: string, me: { id: string; role: string }) {
  if (otherUserId === me.id) return null;
  const other = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!other) return null;
  // Admin puede hablar con cualquiera; un no-admin solo puede hablar con un admin.
  if (me.role !== "ADMIN" && other.role !== "ADMIN") return null;
  return other;
}

function serialize(
  messages: { id: string; body: string; createdAt: Date; senderUserId: string; sender: { name: string } }[],
  meId: string
) {
  return messages.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt,
    senderId: m.senderUserId,
    senderName: m.sender.name,
    mine: m.senderUserId === meId,
  }));
}

// GET /api/messages?shiftId=...     → hilo de un turno.
// GET /api/messages?withUserId=...  → hilo directo con otro usuario (admin ↔ cuidadora).
export async function GET(req: Request) {
  const { user, res } = await apiAuth();
  if (res) return res;

  const params = new URL(req.url).searchParams;
  const shiftId = params.get("shiftId");
  const withUserId = params.get("withUserId");

  // ── Hilo directo ──
  if (withUserId) {
    const other = await resolveDirectPeer(withUserId, user);
    if (!other) return NextResponse.json({ error: "Sin acceso a esta conversación" }, { status: 403 });

    // Marcar como leídos los mensajes que me ha enviado el otro (para badges y email-una-vez).
    await prisma.message.updateMany({
      where: { shiftId: null, senderUserId: other.id, recipientUserId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    const messages = await prisma.message.findMany({
      where: {
        shiftId: null,
        OR: [
          { senderUserId: user.id, recipientUserId: other.id },
          { senderUserId: other.id, recipientUserId: user.id },
        ],
      },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(serialize(messages, user.id));
  }

  // ── Hilo de turno (comportamiento original) ──
  if (!shiftId) return NextResponse.json({ error: "Falta shiftId o withUserId" }, { status: 400 });

  const shift = await canAccessShift(shiftId, user.id, user.role);
  if (!shift) return NextResponse.json({ error: "Sin acceso a este turno" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { shiftId },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(serialize(messages, user.id));
}

const sendSchema = z
  .object({
    shiftId: z.string().min(1).optional(),
    withUserId: z.string().min(1).optional(),
    body: z.string().min(1).max(1000),
    recaptchaToken: z.string().optional(),
  })
  .refine((d) => Boolean(d.shiftId) !== Boolean(d.withUserId), {
    message: "Indica shiftId o withUserId (uno de los dos).",
  });

// POST /api/messages → enviar mensaje (a un turno o directo a otro usuario).
export async function POST(req: Request) {
  const { user, res } = await apiAuth();
  if (res) return res;

  const parsed = sendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  const { shiftId, withUserId, body } = parsed.data;

  // Anti-bot/spam: reCAPTCHA v3. Si no está configurado, no bloquea.
  const rc = await verifyRecaptcha(parsed.data.recaptchaToken, "message");
  if (!rc.ok) {
    return NextResponse.json({ error: "Verificación de seguridad fallida. Inténtalo de nuevo." }, { status: 400 });
  }

  // ── Mensaje directo (admin ↔ cuidadora) ──
  if (withUserId) {
    const other = await resolveDirectPeer(withUserId, user);
    if (!other) return NextResponse.json({ error: "Sin acceso a esta conversación" }, { status: 403 });

    // Aviso por email "una vez hasta que lo lea": solo cuando el ADMIN escribe a un no-admin
    // y NO existe ya un mensaje suyo sin leer en este hilo.
    let shouldEmail = false;
    if (user.role === "ADMIN" && other.role !== "ADMIN") {
      const pendientes = await prisma.message.count({
        where: { shiftId: null, senderUserId: user.id, recipientUserId: other.id, readAt: null },
      });
      shouldEmail = pendientes === 0;
    }

    const msg = await prisma.message.create({
      data: { shiftId: null, senderUserId: user.id, recipientUserId: other.id, body },
    });

    if (shouldEmail) {
      const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://gescuida.es";
      // No bloqueamos la respuesta por un fallo de email; queda registrado en lib/email.
      await sendNewMessageEmail(other.email, other.name, `${base}/cuidadora/mensajes`);
    }

    return NextResponse.json({ id: msg.id }, { status: 201 });
  }

  // ── Mensaje de turno (comportamiento original) ──
  const shift = await canAccessShift(shiftId!, user.id, user.role);
  if (!shift) return NextResponse.json({ error: "Sin acceso a este turno" }, { status: 403 });

  // El destinatario es el "otro lado" del turno.
  const recipientUserId =
    user.id === shift.familyUserId ? shift.caregiverUserId : shift.familyUserId;
  if (!recipientUserId) {
    return NextResponse.json({ error: "El turno aún no tiene cuidadora asignada." }, { status: 409 });
  }

  // Límite de contactos: solo aplica cuando es la FAMILIA quien escribe a una cuidadora.
  // La cuidadora no tiene límite (la plataforma es gratis para ella).
  if (user.role === "FAMILIA") {
    const access = await getAccessStatus(user.id);
    if (!access.subscriptionActive) {
      return NextResponse.json(
        {
          error: "Necesitas la cuota de acceso activa para contactar con cuidadoras.",
          code: "NO_SUBSCRIPTION",
        },
        { status: 402 }
      );
    }

    const { allowed, isNew, usage } = await canContactCaregiver(user.id, recipientUserId);
    if (isNew && !allowed) {
      return NextResponse.json(
        {
          error:
            `Has alcanzado el límite de tu plan: ${usage.limit} ` +
            `${usage.limit === 1 ? "cuidadora" : "cuidadoras"} distintas este mes. ` +
            `Sube al plan superior para contactar con más.`,
          code: "CONTACT_LIMIT",
          limit: usage.limit,
          used: usage.used,
          planKey: usage.planKey,
        },
        { status: 402 }
      );
    }
  }

  const msg = await prisma.message.create({
    data: { shiftId, senderUserId: user.id, recipientUserId, body },
  });

  return NextResponse.json({ id: msg.id }, { status: 201 });
}
