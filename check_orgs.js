const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.findMany();
  console.log("Orgs:", orgs.map(o => ({id: o.id, name: o.name})));
}

main().catch(console.error).finally(() => prisma.$disconnect());
