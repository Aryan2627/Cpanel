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
for (const f of files) {
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace("import { getTenantId } from '../../../../lib/tenant';", "import { getTenantId } from '../../../lib/tenant';");
  fs.writeFileSync(f, code, 'utf8');
  console.log("Fixed import in:", f);
}
