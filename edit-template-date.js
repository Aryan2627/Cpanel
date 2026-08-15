const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching Standard Product Procurement (RFQ) Template...');

  const template = await prisma.template.findFirst({
    where: { name: 'Standard Product Procurement (RFQ)' }
  });

  if (!template) {
    console.log('Template not found!');
    return;
  }

  const existingFields = JSON.parse(template.fields);

  // Update delivery date to use the new 'date' type instead of 'text'
  const newFields = existingFields.map(f => {
    if (f.key === 'req_delivery_date') {
      return {
        ...f,
        type: 'date'
      };
    }
    return f;
  });

  await prisma.template.update({
    where: { id: template.id },
    data: {
      fields: JSON.stringify(newFields)
    }
  });

  console.log('Template updated to use date API successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
