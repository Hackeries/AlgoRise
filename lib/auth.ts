// lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // ← updated path

export async function getSession() {
  return getServerSession(authOptions as any);
}

export async function requireUserId() {
  const session = await getServerSession(authOptions as any);
  const id = (session?.user as any)?.id as string | undefined;
  if (!id) throw new Error("Unauthorized");
  return id;
}
