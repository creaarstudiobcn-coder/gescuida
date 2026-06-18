import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homeForRole } from "@/lib/auth-helpers";

// Tras el login, redirige a cada usuario a su panel según el rol.
export default async function PostLogin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(homeForRole(session.user.role));
}
