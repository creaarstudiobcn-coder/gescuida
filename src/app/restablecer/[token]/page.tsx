import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

// Página de restablecimiento. Validamos el token en el SERVIDOR antes de mostrar el formulario:
// si el enlace no existe, ya se usó o caducó, mostramos un aviso en lugar del formulario.
export default async function RestablecerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  const valid = !!record && record.usedAt === null && record.expiresAt.getTime() >= Date.now();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-6 flex justify-center" aria-label="GesCuida — inicio">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/gescuida-logo-horizontal.svg"
          alt="GesCuida"
          width={170}
          height={48}
          className="h-11 w-auto sm:h-12"
        />
      </Link>
      <div className="card">
        {valid ? (
          <>
            <h1 className="text-2xl font-bold text-marino-800">Crea una nueva contraseña</h1>
            <p className="mt-1 text-marino-600">Escribe tu nueva contraseña dos veces.</p>
            <ResetPasswordForm token={token} />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-marino-800">Enlace no válido</h1>
            <p className="mt-3 text-marino-700">
              Este enlace no es válido, ya se ha usado o ha caducado. Solicita uno nuevo para
              restablecer tu contraseña.
            </p>
            <Link href="/recuperar" className="btn-primary mt-6 inline-block w-full text-center">
              Solicitar un enlace nuevo
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
