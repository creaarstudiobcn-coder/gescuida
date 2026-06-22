import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const centsToEuros = (c: number | null | undefined) =>
  typeof c === "number" ? c / 100 : null;

export async function GET() {
  const { user, res } = await apiAuth("CUIDADORA");
  if (res) return res;

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: user.id } });
  return NextResponse.json({
    name: user.name,
    zones: profile?.zones ?? [],
    otraZona: profile?.otraZona ?? "",
    bio: profile?.bio ?? "",
    training: profile?.training ?? "",
    photoUrl: profile?.photoUrl ?? "",
    availability: profile?.availability ?? null,
    // Tarifa por hora que fija la propia cuidadora (en euros, null si no la ha definido).
    rateMin: centsToEuros(profile?.hourlyRateMinCents),
    rateMax: centsToEuros(profile?.hourlyRateMaxCents),
    verified: profile?.verified ?? false,
    suspended: profile?.suspended ?? false,
  });
}

// La tarifa la fija libremente la cuidadora (rango desde/hasta, en euros). Opcional.
const rateField = z.coerce.number().min(0).max(500).nullable().optional();

const schema = z
  .object({
    zones: z.array(z.string()).optional(),
    otraZona: z.string().max(120).optional(),
    bio: z.string().max(500).optional(),
    training: z.string().max(500).optional(),
    photoUrl: z.string().url().optional().or(z.literal("")),
    availability: z.any().optional(),
    rateMin: rateField,
    rateMax: rateField,
  })
  .refine(
    (d) => d.rateMin == null || d.rateMax == null || d.rateMin <= d.rateMax,
    { message: "La tarifa mínima no puede ser mayor que la máxima.", path: ["rateMin"] }
  );

const eurosToCents = (e: number | null | undefined) =>
  typeof e === "number" && e > 0 ? Math.round(e * 100) : null;

export async function PUT(req: Request) {
  const { user, res } = await apiAuth("CUIDADORA");
  if (res) return res;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos no válidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const d = parsed.data;
  const minCents = eurosToCents(d.rateMin);
  const maxCents = eurosToCents(d.rateMax);

  await prisma.caregiverProfile.upsert({
    where: { userId: user.id },
    update: {
      ...(d.zones ? { zones: d.zones } : {}),
      ...(d.otraZona !== undefined ? { otraZona: d.otraZona.trim() || null } : {}),
      ...(d.bio !== undefined ? { bio: d.bio } : {}),
      ...(d.training !== undefined ? { training: d.training } : {}),
      ...(d.photoUrl !== undefined ? { photoUrl: d.photoUrl || null } : {}),
      ...(d.availability !== undefined ? { availability: d.availability } : {}),
      ...(d.rateMin !== undefined ? { hourlyRateMinCents: minCents } : {}),
      ...(d.rateMax !== undefined ? { hourlyRateMaxCents: maxCents } : {}),
    },
    create: {
      userId: user.id,
      zones: d.zones ?? [],
      otraZona: d.otraZona?.trim() || null,
      bio: d.bio,
      training: d.training,
      photoUrl: d.photoUrl || null,
      availability: d.availability,
      hourlyRateMinCents: minCents,
      hourlyRateMaxCents: maxCents,
    },
  });

  return NextResponse.json({ ok: true });
}
