import { NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  shiftId: z.string().min(1),
  action: z.enum(["COMPLETE", "CANCEL"]),
});

// Completar (cuidadora asignada o admin) o cancelar (familia dueña o admin) un turno.
export async function POST(req: Request) {
  const { user, res } = await apiAuth();
  if (res) return res;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }
  const { shiftId, action } = parsed.data;

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shift) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });

  const isAdmin = user.role === "ADMIN";
  const isOwnerFamily = user.role === "FAMILIA" && shift.familyUserId === user.id;
  const isAssignedCaregiver =
    user.role === "CUIDADORA" && shift.caregiverUserId === user.id;

  if (action === "COMPLETE") {
    if (!isAdmin && !isAssignedCaregiver) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }
    if (shift.status !== "CONFIRMADO") {
      return NextResponse.json({ error: "El turno no está confirmado" }, { status: 409 });
    }
    await prisma.shift.update({
      where: { id: shiftId },
      data: { status: "COMPLETADO", completedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  // CANCEL
  if (!isAdmin && !isOwnerFamily) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }
  if (shift.status === "COMPLETADO") {
    return NextResponse.json({ error: "No se puede cancelar un turno completado" }, { status: 409 });
  }
  await prisma.shift.update({
    where: { id: shiftId },
    // Al cancelar, liberamos las horas (no consumen bolsa).
    data: { status: "CANCELADO", canceledAt: new Date(), hoursFromPlan: 0, hoursFromExtra: 0 },
  });
  return NextResponse.json({ ok: true });
}
