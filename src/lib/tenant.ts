import { prisma } from './prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

/**
 * Returns the logged-in user's organizationId based on their NextAuth session.
 * If there is no session (e.g. testing), it falls back to a default organization
 * to ensure backward compatibility for API tests.
 */
export async function getTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  
  if (session?.user && (session.user as any).organizationId) {
    return (session.user as any).organizationId;
  }

  // Fallback for missing auth / testing
  const orgName = "Default Organization (Acme Corp)";
  let org = await prisma.organization.findFirst({
    where: { name: orgName }
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: orgName,
        domain: "acme.procgen.io",
        theme: JSON.stringify({ primaryColor: "#4f46e5" })
      }
    });
  }

  return org.id;
}
