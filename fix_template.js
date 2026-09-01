const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const templateId = "88d06bdf-5df3-4bc0-9383-87b6efda7d4f";
    
    const existing = await prisma.template.findUnique({
        where: { id: templateId }
    });
    
    if (existing) {
        // Parse the existing fields
        let fields = JSON.parse(existing.fields);
        
        // Map "label" to "name"
        fields = fields.map(f => {
            if (f.label && !f.name) {
                f.name = f.label;
            }
            return f;
        });
        
        // Update the template in the database
        await prisma.template.update({
            where: { id: templateId },
            data: { fields: JSON.stringify(fields) }
        });
        
        console.log("Successfully updated template fields to use 'name'.");
    } else {
        console.log("Template not found by ID. Let's find it by name.");
        const templates = await prisma.template.findMany({
            where: { name: "Standard Vendor Qualification (Technical)" }
        });
        
        for (const t of templates) {
            let fields = JSON.parse(t.fields);
            fields = fields.map(f => {
                if (f.label && !f.name) {
                    f.name = f.label;
                }
                return f;
            });
            await prisma.template.update({
                where: { id: t.id },
                data: { fields: JSON.stringify(fields) }
            });
            console.log("Successfully updated template: " + t.id);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
