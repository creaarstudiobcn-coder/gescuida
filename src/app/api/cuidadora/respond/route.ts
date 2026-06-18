import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { acceptShift, rejectShift } from "@/lib/shifts";

const schema = z.object({
  shiftId: z.string().min(1),
  action: z.enum(["ACEPTADO", "RECHAZADO"]),
});

// La cuidadora ACEPTA o RECHAZA libremente un turno (modelo plataforma, no laboral).
// Se deja constancia de la voluntariedad con timestamp en ShiftResponse.
export async function POST(req: Request) {
  const { user, res } = await apiAuth("CUIDADORA");
  if (res) return res;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }
  const { shiftId, action } = parsed.data;

  if (action === "RECHAZADO") {
    await rejectShift(shiftId, user.id);
    return NextResponse.json({ ok: true, action });
  }

  // Aceptar: solo cuidadoras verificadas por el admin.
  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.verified) {
    return NextResponse.json(
      { error: "Tu perfil aún no está verificado por administración." },
      { status: 403 }
    );
  }
  if (profile.suspended) {
    return NextResponse.json({ error: "Tu cuenta está suspendida." }, { status: 403 });
  }

  try {
    await acceptShift(shiftId, user.id);
    return NextResponse.json({ ok: true, action });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
