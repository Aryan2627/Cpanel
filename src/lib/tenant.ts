import { headers } from "next/headers";
import { prisma } from "./prisma";
import { verifyToken } from "./session";
import { getToken } from "next-auth/jwt"; // Fallback for old sessions

export async function getTenantId(): Promise<string> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";
    
    // Parse cookies manually
    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((c) => c.trim().split("="))
        .filter(([k]) => k)
        .map(([k, ...v]) => [k.trim(), v.join("=").trim()])
    );

    // 1. Try our new reliable custom JWT
    if (cookies['proc-session']) {
      const payload = await verifyToken(cookies['proc-session']);
      if (payload && payload.organizationId) {
        return payload.organizationId;
      }
    }

    // 2. Fallback to next-auth token if it somehow exists
    const mockReq = { headers: { cookie: cookieHeader }, cookies };
    const token = await getToken({
      req: mockReq as any,
      secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-do-not-use-in-production",
    });

    if (token?.organizationId) {
      return token.organizationId as string;
    }
  } catch (e) {
    // fall through to safe fallback
  }

  // Safe fallback: if only 1 org exists (single-tenant mode), return it.
  const orgCount = await prisma.organization.count();
  if (orgCount <= 1) {
    const org = await prisma.organization.findFirst();
    if (org) return org.id;
  }

  // Multi-tenant, unauthenticated - no data leakage
  return "__unauthenticated__";
}
