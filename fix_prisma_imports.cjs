const fs = require('fs');

let code1 = fs.readFileSync('src/app/api/vendors/[id]/route.ts', 'utf8');
code1 = code1.replace("../../../../../lib/prisma", "../../../../lib/prisma");
fs.writeFileSync('src/app/api/vendors/[id]/route.ts', code1, 'utf8');

let code2 = fs.readFileSync('src/app/api/vendor-onboarding/route.ts', 'utf8');
code2 = code2.replace("../../../../lib/prisma", "../../../lib/prisma");
fs.writeFileSync('src/app/api/vendor-onboarding/route.ts', code2, 'utf8');

console.log("Fixed prisma imports.");
