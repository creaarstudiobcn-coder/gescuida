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
    otraZona: p?.otraZona ?? null,
    bio: p?.bio ?? null,
    training: p?.training ?? null,
    photoUrl: p?.photoUrl ?? null,
    availability: p?.availability ?? null,
    hourlyRateMinCents: p?.hourlyRateMinCents ?? null,
    hourlyRateMaxCents: p?.hourlyRateMaxCents ?? null,
  });
}

// DELETE /api/admin/caregivers/[id] → borra PERMANENTEMENTE una cuidadora.
// Antes de borrar, devuelve sus turnos CONFIRMADO a PENDIENTE (sin cuidadora) para que
// puedan reasignarse. El resto de datos enlazados (perfil, respuestas, mensajes…) se
// eliminan en cascada según el schema; los turnos de las familias se conservan.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, res } = await apiAuth("ADMIN");
  if (res) return res;

  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target || target.role !== "CUIDADORA") {
    return NextResponse.json({ error: "Cuidadora no encontrada" }, { status: 404 });
  }
  if (user.id === id) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 });
  }

  await prisma.$transaction([
    // Sus turnos confirmados vuelven a la bolsa de pendientes, sin cuidadora ni dirección revelada.
    prisma.shift.updateMany({
      where: { caregiverUserId: id, status: "CONFIRMADO" },
      data: {
        status: "PENDIENTE",
        caregiverUserId: null,
        acceptedAt: null,
        acceptanceVoluntary: false,
        addressEnc: null,
      },
    }),
    // Borrado del usuario: cascada limpia perfil, respuestas, mensajes y tokens.
    prisma.user.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
