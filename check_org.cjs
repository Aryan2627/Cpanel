const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
// Check if plan field exists in Organization
console.log(schema.includes('plan') ? 'plan field exists' : 'plan field MISSING');
const orgModel = schema.substring(schema.indexOf('model Organization {'), schema.indexOf('}', schema.indexOf('model Organization {')));
console.log(orgModel);
