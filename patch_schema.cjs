const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const orgModelMarker = `model Organization {
  id        String   @id @default(uuid())
  name      String
  domain    String?
  theme     String? // JSON string for colors, logos
  features  String? // JSON string for feature toggles
  industry  String?
  createdAt DateTime @default(now())`;

const newOrgFields = `model Organization {
  id            String   @id @default(uuid())
  name          String
  domain        String?
  theme         String? // JSON string for colors, logos
  features      String? // JSON string for feature toggles
  industry      String?
  licenseStatus String   @default("Active") // Active, Expired, Grace Period
  licensePlan   String   @default("Enterprise")
  licenseExpiry DateTime?
  createdAt     DateTime @default(now())`;

schema = schema.replace(orgModelMarker, newOrgFields);
fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log("Updated schema.prisma with License fields");
