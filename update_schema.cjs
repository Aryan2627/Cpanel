const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
schema = schema.replace('role           String?', 'role           String?\n  password       String?');
fs.writeFileSync('prisma/schema.prisma', schema);
