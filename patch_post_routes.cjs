const fs = require('fs');

const routeFiles = [
  'src/app/api/intakes/route.ts',
  'src/app/api/events/route.ts',
  'src/app/api/pos/route.ts',
  'src/app/api/templates/route.ts',
  'src/app/api/products/route.ts'
];

routeFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  if (code.includes('export async function POST') && !code.includes('const orgId = await getTenantId();', code.indexOf('export async function POST'))) {
    
    // Inject getTenantId at start of POST try block
    code = code.replace(
      /(export async function POST[^{]*\{[\s\n]*try \{)/,
      `$1\n    const orgId = await getTenantId();\n    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({error: 'Unauthorized'}, {status: 401});`
    );
    
    // Inject organizationId into prisma.create data block
    code = code.replace(
      /prisma\.\w+\.create\(\{\s*data:\s*\{/,
      match => `${match}\n        organizationId: orgId,`
    );

    fs.writeFileSync(file, code, 'utf8');
    console.log(`Patched POST in ${file}`);
  }
});
