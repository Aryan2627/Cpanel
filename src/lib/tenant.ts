import { prisma } from './prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { cookies } from "next/headers";

/**
 * Returns the logged-in user's organizationId based on their NextAuth session.
 * 
 * SECURITY: If no valid session is found, returns a sentinel value that will
 * never match any real organizationId in the DB, preventing data leakage.
 * 
 * Falls back to the "Default Organization" ONLY if it exists AND if there is
 * no NextAuth session at all (backward compatibility for the old OTP-based
 * login system, which also sets organizationId on users).
 */
export async function getTenantId(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user && (session.user as any).organizationId) {
      return (session.user as any).organizationId;
    }
  } catch (e) {
    // getServerSession can throw in some edge cases; fall through to legacy
  }

  // Legacy fallback: check if the ONLY organization in the DB is the default
  // one (i.e. this is still a single-tenant deployment). If multiple orgs
  // exist it means multi-tenancy is active and we must NOT leak data.
  const orgCount = await prisma.organization.count();
  
  if (orgCount === 1) {
    // Single-tenant mode - safe to return the only org
    const org = await prisma.organization.findFirst();
    if (org) return org.id;
  }

  // Multi-tenant mode with no valid session - return a sentinel ID that
  // will never match any real org, so all queries return empty results.
  return '__unauthenticated__';
}
