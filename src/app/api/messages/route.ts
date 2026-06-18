import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getAccessStatus } from "@/lib/access";
import { canContactCaregiver } from "@/lib/contacts";
import { verifyRecaptcha } from "@/lib/recaptcha";

// Comprueba que el usuario participa en el turno (familia dueña o cuidadora asignada).
async function canAccessShift(shiftId: string, userId: string, role: string) {
  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shift) return null;
  if (role === "ADMIN") return shift;
  if (role === "FAMILIA" && shift.familyUserId === userId) return shift;
  if (role === "CUIDADORA" && shift.caregiverUserId === userId) return shift;
  return null;
}

// GET /api/messages?shiftId=...  → hilo de mensajes de ese turno.
export async function GET(req: Request) {
  const { user, res } = await apiAuth();
  if (res) return res;

  const shiftId = new URL(req.url).searchParams.get("shiftId");
  if (!shiftId) return NextResponse.json({ error: "Falta shiftId" }, { status: 400 });

  const shift = await canAccessShift(shiftId, user.id, user.role);
  if (!shift) return NextResponse.json({ error: "Sin acceso a este turno" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { shiftId },
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      senderId: m.senderUserId,
      senderName: m.sender.name,
      mine: m.senderUserId === user.id,
    }))
  );
}

const sendSchema = z.object({
  shiftId: z.string().min(1),
  body: z.string().min(1).max(1000),
  recaptchaToken: z.string().optional(),
});

// POST /api/messages → enviar mensaje al otro participante del turno.
export async function POST(req: Request) {
  const { user, res } = await apiAuth();
  if (res) return res;

  const parsed = sendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  const { shiftId, body } = parsed.data;

  // Anti-bot/spam: reCAPTCHA v3. Si no está configurado, no bloquea.
  const rc = await verifyRecaptcha(parsed.data.recaptchaToken, "message");
  if (!rc.ok) {
    return NextResponse.json({ error: "Verificación de seguridad fallida. Inténtalo de nuevo." }, { status: 400 });
  }

  const shift = await canAccessShift(shiftId, user.id, user.role);
  if (!shift) return NextResponse.json({ error: "Sin acceso a este turno" }, { status: 403 });

  // El destinatario es el "otro lado" del turno.
  const recipientUserId =
    user.id === shift.familyUserId ? shift.caregiverUserId : shift.familyUserId;
  if (!recipientUserId) {
    return NextResponse.json(
      { error: "El turno aún no tiene cuidadora asignada." },
      { status: 409 }
    );
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
