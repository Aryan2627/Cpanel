const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const orgs = await prisma.organization.findMany({ select: { id: true, name: true } });
  console.log("Organizations:");
  orgs.forEach(o => console.log(JSON.stringify(o)));

  const users = await prisma.user.findMany({ select: { email: true, name: true, organizationId: true } });
  console.log("\nUsers:");
  users.forEach(u => console.log(JSON.stringify(u)));
  await prisma.$disconnect();
}
main().catch(console.error);
