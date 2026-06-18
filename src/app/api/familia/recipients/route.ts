import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

// Lista las personas a cuidar de la familia (datos sensibles descifrados solo para su dueña).
export async function GET() {
  const { user, res } = await apiAuth("FAMILIA");
  if (res) return res;

  const recipients = await prisma.careRecipient.findMany({
    where: { familyUserId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    recipients.map((r) => ({
      id: r.id,
      name: r.name,
      age: r.age,
      zone: r.zone,
      address: decrypt(r.addressEnc),
      needs: decrypt(r.needsEnc),
      notes: decrypt(r.notesEnc),
    }))
  );
}

const createSchema = z.object({
  name: z.string().min(2),
  age: z.coerce.number().int().min(0).max(120).optional(),
  zone: z.string().min(2),
  address: z.string().optional(),
  needs: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const { user, res } = await apiAuth("FAMILIA");
  if (res) return res;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }
  const d = parsed.data;

  const created = await prisma.careRecipient.create({
    data: {
      familyUserId: user.id,
      name: d.name,
      age: d.age,
      zone: d.zone,
      addressEnc: encrypt(d.address),
      needsEnc: encrypt(d.needs),
      notesEnc: encrypt(d.notes),
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
