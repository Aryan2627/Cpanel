const fs = require('fs');
let code = fs.readFileSync('src/app/api/auth/register/route.ts', 'utf8');

code = code.replace(
  `const { companyName, name, email, password } = await request.json();`,
  `const { companyName, industry, name, email, password } = await request.json();`
);

code = code.replace(
  `name: companyName,\n          features: JSON.stringify({ plan: "Starter", createdAt: new Date().toISOString() })`,
  `name: companyName,\n          industry: industry || null,\n          features: JSON.stringify({ plan: "Starter", createdAt: new Date().toISOString() })`
);

// Add logic to auto-import matching vendors
const importVendorsCode = `
      // Auto-match existing vendors that share this industry
      if (isNewOrg && industry) {
        const matchingVendors = await prisma.vendor.findMany({
          where: { dealsIn: industry },
          distinct: ['email'] // Avoid duplicate emails from different orgs
        });
        
        for (const mv of matchingVendors) {
          if (mv.email) {
            await prisma.vendor.create({
              data: {
                organizationId: org.id,
                name: mv.name,
                email: mv.email,
                phone: mv.phone,
                dealsIn: industry,
                status: 'Pending Onboarding',
                type: 'Supplier'
              }
            });
          }
        }
      }
`;

code = code.replace(
  `// Hash the password`,
  importVendorsCode + `\n      // Hash the password`
);

fs.writeFileSync('src/app/api/auth/register/route.ts', code, 'utf8');
