import type { NextAuthConfig } from "next-auth";

// Configuración compartida y segura para el "edge" (sin Prisma ni bcrypt).
// La usa tanto el middleware como la instancia completa de NextAuth.
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [], // los providers reales se añaden en src/auth.ts (runtime Node)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as never;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
