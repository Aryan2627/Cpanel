const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orgId = 'da588034-f9c3-49b6-89da-a930e3fc1748'; // MM
  
  const rfqFields = [
    { name: 'Scope of Work', type: 'textarea', required: true },
    { name: 'Service Level Agreement (SLA)', type: 'textarea', required: true },
    { name: 'Implementation Timeline (Months)', type: 'number', required: true },
    { name: 'Data Security / ISO Certifications', type: 'text', required: true },
    { name: 'Annual Maintenance Cost ($)', type: 'number', required: false },
    { name: 'Training Included?', type: 'boolean', required: false }
  ];
  
  const template = await prisma.template.create({
    data: {
      organizationId: orgId,
      name: 'Software Services RFQ',
      type: 'RFQ',
      fields: JSON.stringify(rfqFields)
    }
  });
  
  console.log("Template created:", template);
}

main().catch(console.error).finally(() => prisma.$disconnect());
