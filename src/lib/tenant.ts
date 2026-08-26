import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { prisma } from "./prisma";

/**
 * Reads the organizationId from the NextAuth JWT cookie directly.
 * Uses getToken (reads JWT from cookie) instead of getServerSession,
 * which is more reliable in Next.js App Router environments.
 */
export async function getTenantId(): Promise<string> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";

    // Build a minimal request-like object that getToken can read
    const mockReq = {
      headers: { cookie: cookieHeader },
      cookies: Object.fromEntries(
        cookieHeader
          .split(";")
          .map((c) => c.trim().split("="))
          .filter(([k]) => k)
          .map(([k, ...v]) => [k.trim(), v.join("=").trim()])
      ),
    };

    const token = await getToken({
      req: mockReq as any,
      secret:
        process.env.NEXTAUTH_SECRET ||
        "fallback-secret-for-development-do-not-use-in-production",
    });

    if (token?.organizationId) {
      return token.organizationId as string;
    }
  } catch (e) {
    // getToken can throw in edge cases — fall through to safe fallback
  }

  // Safe fallback: if only 1 org exists (single-tenant mode), return it.
  // If multiple orgs exist, we MUST NOT leak data — return sentinel ID.
  const orgCount = await prisma.organization.count();

  if (orgCount <= 1) {
    const org = await prisma.organization.findFirst();
    if (org) return org.id;
  }

  // Multi-tenant, unauthenticated — no data leakage
  return "__unauthenticated__";
}
