import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Mapa de área protegida → rol requerido.
const ROLE_AREAS: { prefix: string; role: "FAMILIA" | "CUIDADORA" | "ADMIN" }[] = [
  { prefix: "/familia", role: "FAMILIA" },
  { prefix: "/cuidadora", role: "CUIDADORA" },
  { prefix: "/admin", role: "ADMIN" },
];

function homeForRole(role?: string) {
  if (role === "FAMILIA") return "/familia";
  if (role === "CUIDADORA") return "/cuidadora";
  if (role === "ADMIN") return "/admin";
  return "/login";
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const user = req.auth?.user;
  const role = user?.role as string | undefined;

  const area = ROLE_AREAS.find((a) => path.startsWith(a.prefix));
  if (!area) return NextResponse.next(); // ruta pública

  // No autenticado → al login (con callback de retorno).
  if (!user) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Autenticado pero rol incorrecto → a su propio panel.
  if (role !== area.role) {
    return NextResponse.redirect(new URL(homeForRole(role), nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Protege las áreas de cada rol (excluye estáticos y API de auth).
  matcher: ["/familia/:path*", "/cuidadora/:path*", "/admin/:path*"],
};
