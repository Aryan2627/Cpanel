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

  // Update delivery location to use the new 'location' type instead of 'dropdown'
  const newFields = existingFields.map(f => {
    if (f.key === 'delivery_location') {
      return {
        ...f,
        type: 'location',
        dropdownOptions: undefined // not needed anymore
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

  console.log('Template updated to use location API successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
