const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRetroactively() {
  // Let's find IR-7369
  const intake = await prisma.intake.findUnique({ where: { refId: 'IR-7369' }});
  if (intake) {
     // Split it as if 1 was awarded
     await prisma.intake.update({
        where: { id: intake.id },
        data: { status: 'Approved', quantity: 1 }
     });
     
     await prisma.intake.create({
        data: {
          organizationId: intake.organizationId,
          refId: intake.refId + '-REM' + Math.floor(Math.random() * 1000),
          title: intake.title,
          reqName: intake.reqName,
          status: 'Open',
          type: intake.type,
          buyer: intake.buyer,
          reqAt: intake.reqAt,
          updAt: intake.updAt,
          source: intake.source,
          erpId: intake.erpId,
          quantity: 1
        }
     });
     console.log("Fixed IR-7369 retroactively!");
  }
}
fixRetroactively().catch(console.error).finally(() => prisma.$disconnect());
