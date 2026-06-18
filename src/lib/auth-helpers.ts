import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";

// Para Server Components / Route Handlers: exige sesión y (opcionalmente) un rol.
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) {
    // Redirige a su propio panel si entra donde no debe.
    redirect(homeForRole(user.role));
  }
  return user;
}

export function homeForRole(role?: Role) {
  switch (role) {
    case "FAMILIA":
      return "/familia";
    case "CUIDADORA":
      return "/cuidadora";
    case "ADMIN":
      return "/admin";
    default:
      return "/login";
  }
}
