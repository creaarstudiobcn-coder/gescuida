import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// GET /api/admin/caregivers/[id] → ficha completa de una cuidadora.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { res } = await apiAuth("ADMIN");
  if (res) return res;

  const { id } = await params;

  const c = await prisma.user.findUnique({
    where: { id },
    include: {
      caregiverProfile: true,
      _count: { select: { shiftsAsCaregiver: true } },
    },
  });

  if (!c || c.role !== "CUIDADORA") {
    return NextResponse.json({ error: "Cuidadora no encontrada" }, { status: 404 });
  }

  const p = c.caregiverProfile;
  return NextResponse.json({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    shiftsCount: c._count.shiftsAsCaregiver,
    verified: p?.verified ?? false,
    verifiedAt: p?.verifiedAt ?? null,
    suspended: p?.suspended ?? false,
    zones: p?.zones ?? [],
    bio: p?.bio ?? null,
    training: p?.training ?? null,
    photoUrl: p?.photoUrl ?? null,
    availability: p?.availability ?? null,
    hourlyRateMinCents: p?.hourlyRateMinCents ?? null,
    hourlyRateMaxCents: p?.hourlyRateMaxCents ?? null,
  });
}
