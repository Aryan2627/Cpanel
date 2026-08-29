const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const intake = await prisma.intake.findUnique({ where: { refId: 'IR-7369' }});
  console.log(intake);
}
check().catch(console.error).finally(() => prisma.$disconnect());
