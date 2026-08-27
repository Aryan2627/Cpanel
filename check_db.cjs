// Check what organizationId the existing intake records actually have in DB
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const intakes = await prisma.intake.findMany({ 
    take: 5, 
    select: { refId: true, title: true, organizationId: true } 
  });
  console.log("Sample intakes:");
  intakes.forEach(i => console.log(JSON.stringify(i)));
  
  const orgs = await prisma.organization.findMany({ 
    select: { id: true, name: true } 
  });
  console.log("\nOrganizations:");
  orgs.forEach(o => console.log(JSON.stringify(o)));
  await prisma.$disconnect();
}
main().catch(console.error);
