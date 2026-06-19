import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { verifyRecaptcha } from "@/lib/recaptcha";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  recaptchaToken: z.string().optional(),
});

// Lee el rol pretendido que el cliente guarda en una cookie justo antes de
// lanzar el flujo de Google (la pestaña Familia/Cuidadora del registro).
// OAuth nos saca de la app y vuelve, así que el estado de React se pierde:
// la cookie es lo que sobrevive al viaje de ida y vuelta a Google.
async function readPendingRole(): Promise<Role> {
  try {
    const v = (await cookies()).get("pending_role")?.value;
    if (v === "CUIDADORA") return "CUIDADORA";
  } catch {
    // sin contexto de request (no debería ocurrir en el callback) → familia
  }
  return "FAMILIA";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      // En NextAuth v5 lee AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET del entorno.
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: { email: {}, password: {}, recaptchaToken: {} },
      async authorize(creds) {
        const parsed = credsSchema.safeParse(creds);
        if (!parsed.success) return null;

        // Anti-bot: reCAPTCHA v3. Si no está configurado, no bloquea.
        const rc = await verifyRecaptcha(parsed.data.recaptchaToken, "login");
        if (!rc.ok) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user) return null;

        // Cuentas creadas solo con Google no tienen contraseña: no pueden
        // entrar por el formulario clásico.
        if (!user.passwordHash) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    // No hay adaptador de Prisma: NextAuth no persiste el usuario por sí solo.
    // Aquí hacemos el alta (o el "login" si ya existe) de las cuentas de Google.
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      // Google verifica los emails; solo enlazamos por email verificado.
      if (!profile?.email_verified || !profile.email) return false;
      const email = profile.email.toLowerCase();

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return true; // ya existe → entrar sin tocar su rol

      const role = await readPendingRole();
      await prisma.user.create({
        data: {
          email,
          name: (profile.name as string) || email.split("@")[0],
          role,
          // El usuario acepta los Términos/Privacidad al pulsar "Continuar con Google".
          consentRGPD: true,
          consentAt: new Date(),
          // Si es cuidadora, creamos su perfil (pendiente de verificación por admin).
          ...(role === "CUIDADORA"
            ? { caregiverProfile: { create: { zones: [], verified: false } } }
            : {}),
        },
      });
      return true;
    },

    // Para Google, el usuario vive en nuestra BD pero no llega por el `user`
    // de credenciales: lo buscamos por email y metemos id + rol en el token.
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        const email = (
          (profile?.email as string | undefined) ??
          (user?.email as string | undefined) ??
          (token.email as string | undefined)
        )?.toLowerCase();
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        }
        return token;
      }
      // Ruta de credenciales (y refrescos de token).
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
});
