import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// Lista de cuidadoras con su estado de verificación.
export async function GET() {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const caregivers = await prisma.user.findMany({
    where: { role: "CUIDADORA" },
    include: {
      caregiverProfile: true,
      _count: { select: { shiftsAsCaregiver: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    caregivers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      zones: c.caregiverProfile?.zones ?? [],
      verified: c.caregiverProfile?.verified ?? false,
      suspended: c.caregiverProfile?.suspended ?? false,
      shiftsCount: c._count.shiftsAsCaregiver,
    }))
  );
}

const actionSchema = z.object({
  caregiverUserId: z.string().min(1),
  action: z.enum(["VERIFY", "UNVERIFY", "SUSPEND", "UNSUSPEND"]),
});

// Verificar / suspender una cuidadora.
export async function POST(req: Request) {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }
  const { caregiverUserId, action } = parsed.data;

  const data =
    action === "VERIFY"
      ? { verified: true, verifiedAt: new Date() }
      : action === "UNVERIFY"
        ? { verified: false, verifiedAt: null }
        : action === "SUSPEND"
          ? { suspended: true }
          : { suspended: false };

  await prisma.caregiverProfile.upsert({
    where: { userId: caregiverUserId },
    update: data,
    create: { userId: caregiverUserId, zones: [], ...data },
  });

  return NextResponse.json({ ok: true });
}
