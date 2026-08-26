const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
// Remove @unique from domain field in Organization model
schema = schema.replace(
  '  domain    String?  @unique\n',
  '  domain    String?\n'
);
fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Removed @unique from domain");
// verify
const lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('domain'));
console.log(lines.slice(idx-1, idx+2).join('\n'));
