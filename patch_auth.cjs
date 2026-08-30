const fs = require('fs');
let code = fs.readFileSync('src/app/api/auth/me/route.ts', 'utf8');

const returnObj = `organizationId: user.organizationId,
        companyName: user.organization?.name || 'My Organization',
        licenseStatus: user.organization?.licenseStatus || 'Active',
        licensePlan: user.organization?.licensePlan || 'Enterprise',
        licenseExpiry: user.organization?.licenseExpiry || null`;

code = code.replace(/organizationId: user\.organizationId,\s*companyName: user\.organization\?\.name \|\| 'My Organization'/, returnObj);

fs.writeFileSync('src/app/api/auth/me/route.ts', code, 'utf8');
console.log("Updated auth/me");
