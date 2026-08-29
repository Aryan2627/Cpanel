const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const pos = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: 'desc' },
    take: 2
  });
  console.log(JSON.stringify(pos, null, 2));
  
  const intakes = await prisma.intake.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(intakes, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
