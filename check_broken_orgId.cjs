const fs = require('fs');
const files = [
  'src/app/api/intakes/route.ts',
  'src/app/api/vendors/route.ts',
  'src/app/api/pos/route.ts',
  'src/app/api/bids/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/templates/route.ts',
  'src/app/api/approvals/route.ts',
];
files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  if (code.includes('organizationId: orgId') && !code.includes('const orgId = await getTenantId();')) {
    console.log("BROKEN:", f);
  }
});
