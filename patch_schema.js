const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');
code = code.replace(
  'features  String? // JSON string for feature toggles\n  createdAt DateTime @default(now())',
  'features  String? // JSON string for feature toggles\n  industry  String?\n  createdAt DateTime @default(now())'
);
fs.writeFileSync('prisma/schema.prisma', code, 'utf8');
