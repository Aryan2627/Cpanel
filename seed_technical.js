const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orgs = await prisma.organization.findMany();
    console.log("Organizations:", JSON.stringify(orgs, null, 2));

    const mmOrg = orgs.find(o => o.name.toLowerCase().includes('mm'));
    
    if (mmOrg) {
        console.log("Found MM Org:", mmOrg.id);
        
        // Define a robust Technical Template
        const templateFields = JSON.stringify([
          { "key": "company_overview", "label": "Company Overview & History", "type": "text", "required": true, "weight": 5 },
          { "key": "iso_9001", "label": "ISO 9001 Certification Upload", "type": "file", "required": true, "weight": 15 },
          { "key": "soc2", "label": "SOC 2 Type II Compliance", "type": "boolean", "required": true, "weight": 15 },
          { "key": "esg_policy", "label": "Sustainability / ESG Policy (Upload)", "type": "file", "required": false, "weight": 10 },
          { "key": "support_sla", "label": "Guaranteed SLA / Support Response Time (Hours)", "type": "number", "required": true, "weight": 20 },
          { "key": "delivery_lead_time", "label": "Standard Delivery Lead Time (Days)", "type": "number", "required": true, "weight": 15 },
          { "key": "past_references", "label": "Past Performance / Client References (Min 2)", "type": "text", "required": true, "weight": 20 }
        ]);

        const newTemplate = await prisma.template.create({
            data: {
                name: "Standard Vendor Qualification (Technical)",
                type: "Technical",
                fields: templateFields,
                organizationId: mmOrg.id
            }
        });
        console.log("Created template:", newTemplate.id);
    } else {
        console.log("MM org not found. Adding to the first one available...");
        if (orgs.length > 0) {
            const org = orgs[0];
            const templateFields = JSON.stringify([
              { "key": "company_overview", "label": "Company Overview & History", "type": "text", "required": true, "weight": 5 },
              { "key": "iso_9001", "label": "ISO 9001 Certification Upload", "type": "file", "required": true, "weight": 15 },
              { "key": "soc2", "label": "SOC 2 Type II Compliance", "type": "boolean", "required": true, "weight": 15 },
              { "key": "esg_policy", "label": "Sustainability / ESG Policy (Upload)", "type": "file", "required": false, "weight": 10 },
              { "key": "support_sla", "label": "Guaranteed SLA / Support Response Time (Hours)", "type": "number", "required": true, "weight": 20 },
              { "key": "delivery_lead_time", "label": "Standard Delivery Lead Time (Days)", "type": "number", "required": true, "weight": 15 },
              { "key": "past_references", "label": "Past Performance / Client References (Min 2)", "type": "text", "required": true, "weight": 20 }
            ]);

            const newTemplate = await prisma.template.create({
                data: {
                    name: "Standard Vendor Qualification (Technical)",
                    type: "Technical",
                    fields: templateFields,
                    organizationId: org.id
                }
            });
            console.log("Created template for Org:", org.name, newTemplate.id);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
