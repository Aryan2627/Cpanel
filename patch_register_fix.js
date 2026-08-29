const fs = require('fs');
let code = fs.readFileSync('src/app/api/auth/register/route.ts', 'utf8');

code = code.replace(
  /const { companyName, email, password, name } = await req\.json\(\);/,
  "const { companyName, email, password, name, industry } = await req.json();"
);

fs.writeFileSync('src/app/api/auth/register/route.ts', code, 'utf8');
console.log("Success");
