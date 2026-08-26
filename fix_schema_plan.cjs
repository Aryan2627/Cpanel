const fs = require('fs');

// 1. Add `plan` field to Organization schema
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
schema = schema.replace(
  '  features  String? // JSON string for feature toggles\n  createdAt DateTime @default(now())',
  '  features  String? // JSON string for feature toggles\n  plan      String? @default("Starter") // Subscription plan\n  createdAt DateTime @default(now())'
);
fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Added plan field to schema");

// 2. Fix the register API to not use `plan` in create until it's migrated
// (actually we need to push the schema first)
