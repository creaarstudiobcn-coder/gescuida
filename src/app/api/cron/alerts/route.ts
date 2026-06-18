import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Marca como "alertado" los turnos sin cubrir cuyo plazo (alertDeadline) ya venció.
// Pensado para ejecutarse con Vercel Cron (ver vercel.json). Protegido con CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const now = new Date();
  const result = await prisma.shift.updateMany({
    where: {
      status: "PENDIENTE",
      caregiverUserId: null,
      alertedAdmin: false,
      alertDeadline: { lt: now },
    },
    data: { alertedAdmin: true },
  });

  return NextResponse.json({ ok: true, nuevasAlertas: result.count });
}
