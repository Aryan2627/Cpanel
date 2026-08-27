// Count intakes by orgId
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const nullCount = await prisma.intake.count({ where: { organizationId: null } });
  const defaultOrgCount = await prisma.intake.count({ where: { organizationId: "62969b20-f024-4c29-808c-f6f278c7bfef" } });
  const total = await prisma.intake.count();
  
  console.log("Total intakes:", total);
  console.log("With organizationId=null:", nullCount);
  console.log("With default org:", defaultOrgCount);
  
  // Check what users exist
  const users = await prisma.user.findMany({ 
    select: { email: true, organizationId: true, password: true } 
  });
  console.log("\nUsers:");
  users.forEach(u => console.log(JSON.stringify({ 
    email: u.email, 
    organizationId: u.organizationId, 
    hasPassword: !!u.password 
  })));
  await prisma.$disconnect();
}
main().catch(console.error);
