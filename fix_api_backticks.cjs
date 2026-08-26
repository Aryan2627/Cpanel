const fs = require('fs');
let code = fs.readFileSync('src/app/api/approvals/route.ts', 'utf8');

code = code.replace(/\\`Purchase Order for: \\\$\{event\?\.title \|\| 'Unknown'\}[\\]*`/g, '`Purchase Order for: ${event?.title || \'Unknown\'}`');

fs.writeFileSync('src/app/api/approvals/route.ts', code, 'utf8');
console.log('Fixed backticks in api');
