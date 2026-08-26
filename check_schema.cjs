const fs = require('fs');
const lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');
console.log(lines.slice(0, 50).join('\n'));
