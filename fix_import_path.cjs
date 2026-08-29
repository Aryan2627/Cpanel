const fs = require('fs');
let code = fs.readFileSync('src/app/api/vendor-onboarding/route.ts', 'utf8');

code = code.replace("import { prisma } from '../../../../lib/prisma';", "import { prisma } from '../../../lib/prisma';");

fs.writeFileSync('src/app/api/vendor-onboarding/route.ts', code, 'utf8');
console.log("Fixed prisma import.");
