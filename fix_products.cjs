const fs = require('fs');
let code = fs.readFileSync('src/app/api/products/route.ts', 'utf8');
code = code.replace(
  '  try {\n    const products = await prisma.product.findMany',
  '  try {\n    const orgId = await getTenantId();\n    const products = await prisma.product.findMany'
);
fs.writeFileSync('src/app/api/products/route.ts', code, 'utf8');
console.log("Fixed products route");
