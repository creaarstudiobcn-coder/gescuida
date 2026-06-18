import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api";
import { getAccessStatus } from "@/lib/access";
import { getContactUsage } from "@/lib/contacts";

// Estado de la cuota de acceso de la familia + uso del cupo de contactos del ciclo.
export async function GET() {
  const { user, res } = await apiAuth("FAMILIA");
  if (res) return res;
  const access = await getAccessStatus(user.id);
  const contacts = await getContactUsage(user.id, access);
  return NextResponse.json({ ...access, contacts });
}
