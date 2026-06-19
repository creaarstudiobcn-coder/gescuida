import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ⚠️ ENDPOINT TEMPORAL DE DIAGNÓSTICO — borrar tras depurar el login con Google.
// Reproduce lo que hace el callback signIn contra la BD de PRODUCCIÓN para
// localizar por qué sale "Access Denied", sin depender de los logs de Vercel.
// Uso:  /api/debug/google-auth?key=gescuida-debug-7Kx9
//       /api/debug/google-auth?key=gescuida-debug-7Kx9&email=otra@gmail.com

export const dynamic = "force-dynamic";

const KEY = "gescuida-debug-7Kx9";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== KEY) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const email = (url.searchParams.get("email") ?? "creaarstudiobcn@gmail.com").toLowerCase();
  const out: Record<string, unknown> = { email };

  // 1) ¿La columna passwordHash es NULLABLE en la BD de producción?
  try {
    out.passwordHashColumn = await prisma.$queryRaw`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User' AND column_name = 'passwordHash'`;
  } catch (e) {
    out.columnCheckError = String(e);
  }

  // 2) ¿El usuario YA EXISTE en producción?
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, passwordHash: true, createdAt: true },
    });
    out.userExists = !!user;
    out.user = user
      ? { id: user.id, role: user.role, hasPassword: !!user.passwordHash, createdAt: user.createdAt }
      : null;
  } catch (e) {
    out.userQueryError = String(e);
  }

  // 3) Prueba de creación de un usuario SIN contraseña (igual que el callback),
  //    dentro de una transacción que SIEMPRE hace rollback (no persiste nada).
  //    Si la columna sigue siendo NOT NULL en producción, aquí veremos el error
  //    real de Prisma — que es lo que provoca el "Access Denied".
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email: "__probe__@gescuida.local",
          name: "probe",
          role: "FAMILIA",
          consentRGPD: true,
          consentAt: new Date(),
        },
      });
      throw new Error("__ROLLBACK__"); // forzamos rollback: nunca se guarda
    });
  } catch (e) {
    const msg = String(e);
    out.createProbe = msg.includes("__ROLLBACK__")
      ? "OK — crear usuarios sin contraseña FUNCIONA (la migración está aplicada)"
      : `FALLA al crear sin contraseña → ${msg}`;
  }

  return NextResponse.json(out, { status: 200 });
}
