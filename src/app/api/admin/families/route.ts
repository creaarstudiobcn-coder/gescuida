import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// GET /api/admin/families → lista de TODAS las familias (tengan o no suscripción).
export async function GET() {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const families = await prisma.user.findMany({
    where: { role: "FAMILIA" },
    include: {
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" } },
      _count: { select: { careRecipients: true, shiftsAsFamily: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    families.map((f) => {
      // Suscripción relevante: la activa; si no, la impagada; si no, ninguna.
      const sub =
        f.subscriptions.find((s) => s.status === "ACTIVE") ??
        f.subscriptions.find((s) => s.status === "PAST_DUE") ??
        null;
      return {
        id: f.id,
        name: f.name,
        email: f.email,
        phone: f.phone,
        createdAt: f.createdAt,
        subscriptionStatus: sub ? sub.status : "NONE",
        planName: sub?.plan.name ?? null,
        recipientsCount: f._count.careRecipients,
        shiftsCount: f._count.shiftsAsFamily,
      };
    })
  );
}
