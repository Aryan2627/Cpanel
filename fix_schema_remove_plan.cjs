const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
schema = schema.replace(
  '  features  String? // JSON string for feature toggles\n  plan      String? @default("Starter") // Subscription plan\n  createdAt DateTime @default(now())',
  '  features  String? // JSON string for feature toggles (also stores plan info)\n  createdAt DateTime @default(now())'
);
fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Removed plan field from schema");
