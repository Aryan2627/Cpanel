const fs = require('fs');
let code = fs.readFileSync('src/app/api/pos/route.ts', 'utf8');

if (!code.includes('import { getTenantId }')) {
  code = code.replace(
    `import { prisma } from '../../../lib/prisma';`,
    `import { prisma } from '../../../lib/prisma';\nimport { getTenantId } from '../../../lib/tenant';`
  );
  fs.writeFileSync('src/app/api/pos/route.ts', code, 'utf8');
  console.log("Success");
} else {
  console.log("Already imported");
}
