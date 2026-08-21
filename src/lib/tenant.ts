import { prisma } from './prisma';

/**
 * MOCK AUTHENTICATION & MULTI-TENANCY
 * In a real application, this would decode a JWT or NextAuth session cookie
 * and return the specific user's organizationId. 
 * 
 * For this proof of concept, we will look up the "Default Organization"
 * or create it if it doesn't exist, and return its ID.
 */
export async function getTenantId(): Promise<string> {
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
