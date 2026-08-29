const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orgId = 'da588034-f9c3-49b6-89da-a930e3fc1748'; // MM
  
  const rfqFields = [
    { name: 'Item Description', type: 'text', required: true },
    { name: 'Quantity', type: 'number', required: true },
    { name: 'Unit of Measure', type: 'text', required: true },
    { name: 'Target Delivery Date', type: 'date', required: true },
    { name: 'Delivery Location', type: 'text', required: true },
    { name: 'Quality/Certifications Required', type: 'text', required: false },
    { name: 'Payment Terms (e.g. Net 30)', type: 'text', required: false },
    { name: 'Warranty Period', type: 'text', required: false }
  ];
  
  const template = await prisma.template.create({
    data: {
      organizationId: orgId,
      name: 'Standard Hardware RFQ',
      type: 'RFQ',
      fields: JSON.stringify(rfqFields)
    }
  });
  
  console.log("Template created:", template);
}

main().catch(console.error).finally(() => prisma.$disconnect());
