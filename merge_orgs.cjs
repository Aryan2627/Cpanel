const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const masterOrgId = 'fce05ae8-af9b-458e-8337-43055fb8fa1a'; // The first ZEPHYRA TECHNOLOGIES
  
  const duplicateOrgs = [
    'eceb6a65-c032-4516-89df-51c099825a65',
    'd9b6b646-8746-48c2-bd3b-72d29489e9d9'
  ];

  for (const dupId of duplicateOrgs) {
    // Move all users
    await prisma.user.updateMany({
      where: { organizationId: dupId },
      data: { organizationId: masterOrgId }
    });
    
    // Move all other potentially related data just in case
    await prisma.intake.updateMany({ where: { organizationId: dupId }, data: { organizationId: masterOrgId } });
    await prisma.event.updateMany({ where: { organizationId: dupId }, data: { organizationId: masterOrgId } });
    await prisma.vendor.updateMany({ where: { organizationId: dupId }, data: { organizationId: masterOrgId } });
    await prisma.product.updateMany({ where: { organizationId: dupId }, data: { organizationId: masterOrgId } });
    await prisma.template.updateMany({ where: { organizationId: dupId }, data: { organizationId: masterOrgId } });
    await prisma.purchaseOrder.updateMany({ where: { organizationId: dupId }, data: { organizationId: masterOrgId } });
    
    // Delete the duplicate organization
    await prisma.organization.delete({
      where: { id: dupId }
    });
    
    console.log(`Merged duplicate org ${dupId} into master ${masterOrgId}`);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
