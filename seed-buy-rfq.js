const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Buyer RFQ Template...');

  const rfqFields = [
    { id: 'b1', name: 'Product/Item to Procure', key: 'product_item', type: 'product', role: 'Creator', required: true },
    { id: 'b2', name: 'Required Quantity', key: 'target_quantity', type: 'number', role: 'Creator', required: true },
    { id: 'b3', name: 'Unit Price Bid', key: 'unit_price', type: 'number', role: 'Participant', required: true },
    { id: 'b4', name: 'Total Extended Price', key: 'total_price', type: 'number', role: 'Calculation', formula: 'target_quantity * unit_price', required: false },
    { id: 'b5', name: 'Delivery Lead Time (Days)', key: 'lead_time_days', type: 'number', role: 'Participant', required: true },
    { id: 'b6', name: 'Warranty Terms', key: 'warranty_terms', type: 'text', role: 'Participant', required: true },
    { id: 'b7', name: 'Shipping Included?', key: 'shipping_included', type: 'dropdown', dropdownOptions: 'Yes, No', role: 'Participant', required: true }
  ];

  await prisma.template.create({
    data: {
      name: 'Standard Product Procurement (RFQ)',
      type: 'RFQ',
      fields: JSON.stringify(rfqFields)
    }
  });

  console.log('Buyer RFQ Template seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
