import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { getAccessStatus } from "@/lib/access";
import { getContactUsage } from "@/lib/contacts";
import { assertStripe } from "@/lib/stripe";

// Suscripciones que siguen vivas en Stripe y habría que cancelar antes de borrar.
function liveStripeSubs(
  subs: { stripeSubscriptionId: string | null; status: string }[]
): string[] {
  return subs
    .filter((s) => s.stripeSubscriptionId && (s.status === "ACTIVE" || s.status === "PAST_DUE"))
    .map((s) => s.stripeSubscriptionId as string);
}

// GET /api/admin/families/[id] → ficha completa: datos, suscripción y personas a cuidar.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const { id } = await params;

  const f = await prisma.user.findUnique({
    where: { id },
    include: {
      careRecipients: {
        include: { _count: { select: { shifts: true } } },
        orderBy: { createdAt: "asc" },
      },
      subscriptions: true,
      _count: { select: { shiftsAsFamily: true, payments: true } },
    },
  });

  if (!f || f.role !== "FAMILIA") {
    return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
  }

  const access = await getAccessStatus(id);
  const usage = await getContactUsage(id, access);
  const status =
    access.status === "ACTIVE" || access.status === "PAST_DUE" ? access.status : "NONE";

  return NextResponse.json({
    id: f.id,
    name: f.name,
    email: f.email,
    phone: f.phone,
    createdAt: f.createdAt,
    subscriptionStatus: status,
    planName: access.planName,
    contactsUsed: usage.used,
    contactLimit: usage.limit,
    periodEnd: access.periodEnd,
    hasStripeSubscription: liveStripeSubs(f.subscriptions).length > 0,
    recipients: f.careRecipients.map((r) => ({
      id: r.id,
      name: r.name,
      age: r.age,
      zone: r.zone,
      address: decrypt(r.addressEnc),
      needs: decrypt(r.needsEnc),
      notes: decrypt(r.notesEnc),
      shiftsCount: r._count.shifts,
    })),
    shiftsCount: f._count.shiftsAsFamily,
    paymentsCount: f._count.payments,
  });
}

// DELETE /api/admin/families/[id] → borra PERMANENTEMENTE una familia.
// Antes de borrar, cancela en Stripe cualquier suscripción viva (ACTIVE/PAST_DUE). Si la
// cancelación de Stripe falla, NO se borra la familia: se evita dejarla activa en Stripe.
// Tras cancelar, el borrado del usuario limpia en cascada personas a cuidar, turnos, pagos,
// suscripciones y mensajes según el schema.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const { id } = await params;

  const f = await prisma.user.findUnique({
    where: { id },
    include: { subscriptions: { select: { stripeSubscriptionId: true, status: true } } },
  });
  if (!f || f.role !== "FAMILIA") {
    return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
  }

  // 1) Cancelar en Stripe antes de tocar la base. Si falla, abortamos sin borrar.
  for (const subId of liveStripeSubs(f.subscriptions)) {
    try {
      await assertStripe().subscriptions.cancel(subId);
    } catch (e) {
      const err = e as { code?: string };
      if (err?.code === "resource_missing") continue; // ya no existe en Stripe → seguimos
      return NextResponse.json(
        {
          error: `No se pudo cancelar la suscripción en Stripe (${(e as Error).message}). No se ha borrado la familia.`,
        },
        { status: 502 }
      );
    }
  }

  // 2) Stripe limpio → borrado en cascada.
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
