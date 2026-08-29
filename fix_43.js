const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRetroactively() {
  const intake = await prisma.intake.findUnique({ where: { refId: 'IR-7369' }});
  if (intake) {
     await prisma.intake.update({
        where: { id: intake.id },
        data: { quantity: 43 } // Setting it to 43 as requested
     });
     console.log("Fixed IR-7369 to 43!");
  }
}
fixRetroactively().catch(console.error).finally(() => prisma.$disconnect());
