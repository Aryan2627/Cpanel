const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orgId = 'da588034-f9c3-49b6-89da-a930e3fc1748'; // MM
  
  // First, delete the broken templates we just created
  await prisma.template.deleteMany({
    where: {
      name: {
        in: ['Standard Hardware RFQ', 'Software Services RFQ']
      }
    }
  });
  
  // Create Hardware Template
  const hwFields = [
    { id: '1', name: 'Item Description', key: 'item_description', type: 'text', required: true, role: 'Participant', dropdownOptions: '' },
    { id: '2', name: 'Quantity', key: 'quantity', type: 'number', required: true, role: 'Participant', dropdownOptions: '' },
    { id: '3', name: 'Base Price per Unit', key: 'base_price', type: 'number', required: true, role: 'Participant', dropdownOptions: '' },
    { id: '4', name: 'Total Price', key: 'total_price', type: 'number', required: true, role: 'Calculation', formula: 'quantity * base_price', dropdownOptions: '' },
    { id: '5', name: 'Target Delivery Date', key: 'delivery_date', type: 'date', required: true, role: 'Participant', dropdownOptions: '' },
    { id: '6', name: 'Quality/Certifications Required', key: 'quality_certs', type: 'text', required: false, role: 'Participant', dropdownOptions: '' },
    { id: '7', name: 'Payment Terms (e.g. Net 30)', key: 'payment_terms', type: 'text', required: false, role: 'Participant', dropdownOptions: '' },
    { id: '8', name: 'Warranty Period (Months)', key: 'warranty_period', type: 'number', required: false, role: 'Participant', dropdownOptions: '' }
  ];
  
  await prisma.template.create({
    data: {
      organizationId: orgId,
      name: 'Standard Hardware RFQ',
      type: 'RFQ',
      fields: JSON.stringify(hwFields)
    }
  });

  // Create Software Template
  const swFields = [
    { id: '1', name: 'Scope of Work', key: 'scope_work', type: 'textarea', required: true, role: 'Participant', dropdownOptions: '' },
    { id: '2', name: 'Service Level Agreement (SLA)', key: 'sla', type: 'textarea', required: true, role: 'Participant', dropdownOptions: '' },
    { id: '3', name: 'Implementation Timeline (Months)', key: 'implementation_timeline', type: 'number', required: true, role: 'Participant', dropdownOptions: '' },
    { id: '4', name: 'Data Security / ISO Certifications', key: 'data_security', type: 'text', required: true, role: 'Participant', dropdownOptions: '' },
    { id: '5', name: 'Annual Maintenance Cost ($)', key: 'maintenance_cost', type: 'number', required: false, role: 'Participant', dropdownOptions: '' },
    { id: '6', name: 'Training Included?', key: 'training_included', type: 'dropdown', dropdownOptions: 'Yes, No', required: false, role: 'Participant' }
  ];

  await prisma.template.create({
    data: {
      organizationId: orgId,
      name: 'Software Services RFQ',
      type: 'RFQ',
      fields: JSON.stringify(swFields)
    }
  });
  
  console.log("Templates successfully replaced with correct schema.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
