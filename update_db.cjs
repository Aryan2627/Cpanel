const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateIntakes() {
  const intakes = await prisma.intake.findMany();
  let updatedCount = 0;
  for (const intake of intakes) {
    if (!intake.refId.startsWith('IR-')) {
      let finalRef = intake.refId.replace(/^INT-/, 'IR-').replace(/^[A-Za-z]+-/, 'IR-');
      if (!finalRef.startsWith('IR-')) finalRef = 'IR-' + finalRef;
      
      await prisma.intake.update({
        where: { id: intake.id },
        data: { refId: finalRef }
      });
      updatedCount++;
    }
  }
  console.log('Updated ' + updatedCount + ' intakes to start with IR-');
}
updateIntakes().finally(() => prisma.$disconnect());
