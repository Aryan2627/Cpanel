const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding templates...');

  const techFields = [
    { id: 't1', name: 'Vendor Company Profile', key: 'vendor_profile', type: 'text', role: 'Participant', section: 'Company Info', required: true, weight: 0 },
    { id: 't2', name: 'ISO 27001 Certification', key: 'iso_27001', type: 'file', role: 'Participant', section: 'Compliance', required: true, weight: 15 },
    { id: 't3', name: 'GDPR Compliance Status', key: 'gdpr', type: 'dropdown', dropdownOptions: 'Fully Compliant, Partially Compliant, Not Compliant', role: 'Participant', section: 'Compliance', required: true, weight: 10 },
    { id: 't4', name: 'Data Center Location', key: 'dc_location', type: 'text', role: 'Participant', section: 'Architecture', required: true, weight: 5 },
    { id: 't5', name: 'Uptime SLA Guarantee (%)', key: 'uptime_sla', type: 'percentage', role: 'Participant', section: 'Architecture', required: true, weight: 20 },
    { id: 't6', name: 'API Documentation Link', key: 'api_docs', type: 'text', role: 'Participant', section: 'Architecture', required: false, weight: 5 },
    { id: 't7', name: 'Security Audit Report', key: 'sec_audit', type: 'file', role: 'Participant', section: 'Security', required: true, weight: 15 },
    { id: 't8', name: 'SSO Integration Supported', key: 'sso', type: 'dropdown', dropdownOptions: 'Yes, No', role: 'Participant', section: 'Security', required: true, weight: 10 },
    { id: 't9', name: 'Disaster Recovery RTO (Hours)', key: 'rto_hours', type: 'number', role: 'Participant', section: 'Architecture', required: true, weight: 10 },
    { id: 't10', name: 'Project Manager Years of Exp', key: 'pm_exp', type: 'number', role: 'Participant', section: 'Team', required: true, weight: 5 },
    { id: 't11', name: 'Dedicated Account Manager', key: 'acc_manager', type: 'dropdown', dropdownOptions: 'Yes, No', role: 'Participant', section: 'Team', required: true, weight: 5 },
    { id: 't12', name: 'Min Implementation Time (Days)', key: 'impl_days', type: 'number', role: 'Participant', section: 'Implementation', required: true, weight: 0 },
    { id: 't13', name: 'Training Provided', key: 'training_type', type: 'dropdown', dropdownOptions: 'Onsite, Online, None', role: 'Participant', section: 'Implementation', required: true, weight: 0 },
    { id: 't14', name: 'Support Tier Included', key: 'support_tier', type: 'dropdown', dropdownOptions: '24/7 Premium, Standard Business Hours, Basic Email', role: 'Participant', section: 'Support', required: true, weight: 0 }
  ];

  const rfqFields = [
    { id: 'r0', name: 'Product Category', key: 'product_category', type: 'product', role: 'Creator', section: 'Item Details', required: true, weight: 0 },
    { id: 'r1', name: 'Base Unit Price', key: 'base_price', type: 'number', role: 'Participant', section: 'Pricing', required: true, weight: 40, targetPrice: '500' },
    { id: 'r2', name: 'Volume Discount (%)', key: 'vol_discount', type: 'percentage', role: 'Participant', section: 'Pricing', required: false, weight: 10 },
    { id: 'r3', name: 'Annual Maintenance Cost', key: 'amc_cost', type: 'number', role: 'Participant', section: 'Pricing', required: true, weight: 15 },
    { id: 'r4', name: 'Delivery Lead Time (Days)', key: 'lead_time', type: 'number', role: 'Participant', section: 'Logistics', required: true, weight: 10, targetPrice: '14' },
    { id: 'r5', name: 'Shipping Cost', key: 'shipping_cost', type: 'number', role: 'Participant', section: 'Logistics', required: true, weight: 5 },
    { id: 'r6', name: 'Warranty Period (Months)', key: 'warranty_months', type: 'number', role: 'Participant', section: 'Terms', required: true, weight: 10 },
    { id: 'r7', name: 'Payment Terms', key: 'payment_terms', type: 'dropdown', dropdownOptions: 'Net 30, Net 60, Net 90, Due on Receipt', role: 'Participant', section: 'Terms', required: true, weight: 5 },
    { id: 'r8', name: 'Installation Cost', key: 'install_cost', type: 'number', role: 'Participant', section: 'Services', required: false, weight: 5 },
    { id: 'r9', name: 'Training Cost', key: 'training_cost', type: 'number', role: 'Participant', section: 'Services', required: false, weight: 0 },
    { id: 'r10', name: 'Currency', key: 'currency', type: 'dropdown', dropdownOptions: 'USD, EUR, GBP, AUD', role: 'Participant', section: 'Terms', required: true, weight: 0 },
    { id: 'r11', name: 'Environmental Surcharge', key: 'env_surcharge', type: 'number', role: 'Participant', section: 'ESG', required: false, weight: 0 },
    { id: 'r12', name: 'Carbon Offset Contribution', key: 'carbon_offset', type: 'number', role: 'Participant', section: 'ESG', required: false, weight: 0 }
  ];

  await prisma.template.create({
    data: {
      name: 'Comprehensive Enterprise Technical Assessment',
      type: 'Technical',
      fields: JSON.stringify(techFields)
    }
  });

  await prisma.template.create({
    data: {
      name: 'Comprehensive Hardware & Services RFQ',
      type: 'RFQ',
      fields: JSON.stringify(rfqFields)
    }
  });

  console.log('Templates seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
