const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.event.create({
    data: {
      refId: 'EVT-TEST-100',
      title: 'Test Vendor Event',
      type: 'Rank based',
      account: 'Internal',
      itemsCount: 1,
      stages: '[{"name":"Demo template","mode":"Live Event"}]',
      participants: JSON.stringify([
        {
          id: "8e73fb8d-bfe2-40f8-b424-62aa3bd182ee",
          name: "vghbjnklm;,",
          email: "hbjnkml@gmail.com"
        }
      ])
    }
  });
  console.log('Created test event successfully');
}
main();
