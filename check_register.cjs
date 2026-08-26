const fs = require('fs');
// Check the register API - see if it references `plan`
const code = fs.readFileSync('src/app/api/auth/register/route.ts', 'utf8');
console.log(code);
