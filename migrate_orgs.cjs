// Migrate all null-org records to belong to the Default Org
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DEFAULT_ORG_ID = "62969b20-f024-4c29-808c-f6f278c7bfef";

async function main() {
  // Migrate intakes
  const i = await prisma.intake.updateMany({ where: { organizationId: null }, data: { organizationId: DEFAULT_ORG_ID } });
  console.log("Migrated intakes:", i.count);
  
  // Migrate events
  const e = await prisma.event.updateMany({ where: { organizationId: null }, data: { organizationId: DEFAULT_ORG_ID } });
  console.log("Migrated events:", e.count);
  
  // Migrate vendors
  const v = await prisma.vendor.updateMany({ where: { organizationId: null }, data: { organizationId: DEFAULT_ORG_ID } });
  console.log("Migrated vendors:", v.count);
  
  // Migrate purchase orders
  const p = await prisma.purchaseOrder.updateMany({ where: { organizationId: null }, data: { organizationId: DEFAULT_ORG_ID } });
  console.log("Migrated POs:", p.count);
  
  // Migrate bids
  const b = await prisma.bid.updateMany({ where: { organizationId: null }, data: { organizationId: DEFAULT_ORG_ID } });
  console.log("Migrated bids:", b.count);
  
  // Migrate products
  const pr = await prisma.product.updateMany({ where: { organizationId: null }, data: { organizationId: DEFAULT_ORG_ID } });
  console.log("Migrated products:", pr.count);
  
  // Migrate templates
  const t = await prisma.template.updateMany({ where: { organizationId: null }, data: { organizationId: DEFAULT_ORG_ID } });
  console.log("Migrated templates:", t.count);
  
  // Migrate workflows
  const w = await prisma.workflow.updateMany({ where: { organizationId: null }, data: { organizationId: DEFAULT_ORG_ID } });
  console.log("Migrated workflows:", w.count);
  
  // Migrate approval requests
  const ar = await prisma.approvalRequest.updateMany({ where: { organizationId: null }, data: { organizationId: DEFAULT_ORG_ID } });
  console.log("Migrated approvals:", ar.count);

  console.log("\nAll null-org records migrated to Default Org. Isolation is now complete.");
  await prisma.$disconnect();
}
main().catch(console.error);
