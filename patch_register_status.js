const fs = require('fs');
let code = fs.readFileSync('src/app/api/vendors/register/route.ts', 'utf8');

code = code.replace(/status: 'Pending Onboarding'/g, "status: 'Onboarding in Progress'");

fs.writeFileSync('src/app/api/vendors/register/route.ts', code, 'utf8');
console.log("Updated registration status.");
