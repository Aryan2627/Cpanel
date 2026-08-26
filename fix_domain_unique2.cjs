const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
console.log("Before:", schema.includes('@unique') && schema.indexOf('domain') < schema.indexOf('@unique') ? 'unique still there' : 'checking...');
// More aggressive replacement
schema = schema.replace(/domain\s+String\?\s+@unique/g, 'domain    String?');
fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Done");
const lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('domain') && !l.includes('//'));
console.log("Line:", lines[idx]);
