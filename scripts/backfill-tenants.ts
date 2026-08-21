import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfill() {
  console.log("Starting backfill process...");
  
  const orgName = "Default Organization (Acme Corp)";
  let org = await prisma.organization.findFirst({ where: { name: orgName } });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: orgName,
        domain: "acme.procgen.io",
      }
    });
    console.log(`Created new Default Organization with ID: ${org.id}`);
  } else {
    console.log(`Found existing Default Organization with ID: ${org.id}`);
  }

  // Define all the models we need to backfill
  const models = [
    'user', 'team', 'location', 'category', 'product', 'intake', 
    'event', 'vendor', 'purchaseOrder', 'bid', 'contract', 
    'template', 'jarvisMemory', 'workflow', 'approvalRequest'
  ];

  for (const model of models) {
    try {
      // @ts-ignore
      const result = await prisma[model].updateMany({
        where: { organizationId: null },
        data: { organizationId: org.id }
      });
      console.log(`Backfilled ${result.count} records for model: ${model}`);
    } catch (e: any) {
      console.error(`Error backfilling model ${model}:`, e.message);
    }
  }

  console.log("Backfill complete!");
  process.exit(0);
}

backfill();
