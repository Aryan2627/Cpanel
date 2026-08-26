const fs = require('fs');
const path = require('path');

// Routes to patch with getTenantId for GET (read) operations
const ROUTES_TO_PATCH = [
  'src/app/api/intakes/route.ts',
  'src/app/api/vendors/route.ts',
  'src/app/api/pos/route.ts',
  'src/app/api/bids/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/templates/route.ts',
  'src/app/api/approvals/route.ts',
];

const TENANT_IMPORT = `import { getTenantId } from '../../../lib/tenant';\n`;
const TENANT_IMPORT_4 = `import { getTenantId } from '../../../../lib/tenant';\n`;

let patchCount = 0;

for (const routePath of ROUTES_TO_PATCH) {
  let code = fs.readFileSync(routePath, 'utf8');
  
  if (code.includes('getTenantId')) {
    console.log(`SKIP (already patched): ${routePath}`);
    continue;
  }

  // Depth of route (how many levels deep for import path)
  const depth = routePath.split('/').length - 3; // src/app/api/X = depth 1, src/app/api/X/Y = depth 2
  const importLine = depth <= 1 ? TENANT_IMPORT : TENANT_IMPORT_4;

  // Add import after the first import line
  code = code.replace(
    /^(import [^\n]+\n)/,
    `$1${importLine}`
  );

  // Patch the GET function: after "try {", add orgId line
  // and add WHERE clause to first findMany/findFirst/count call
  code = code.replace(
    /(export async function GET[^{]*\{[\s\n]*try \{)/,
    `$1\n    const orgId = await getTenantId();`
  );

  // Patch findMany to add organizationId filter
  code = code.replace(
    /prisma\.\w+\.findMany\(\{/,
    (match) => `${match}\n      where: { organizationId: orgId },`
  );

  fs.writeFileSync(routePath, code, 'utf8');
  console.log(`PATCHED: ${routePath}`);
  patchCount++;
}

console.log(`\nPatched ${patchCount} routes.`);
