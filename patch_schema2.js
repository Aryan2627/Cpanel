const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');
code = code.replace(
  'features  String? // JSON string for feature toggles',
  'features  String? // JSON string for feature toggles\n  industry  String?'
);
fs.writeFileSync('prisma/schema.prisma', code, 'utf8');
