const fs = require('fs');
let apiContent = fs.readFileSync('src/app/api/intakes/route.ts', 'utf8');
apiContent = apiContent.replace(/INT-\$\{Date\.now\(\)\}/g, 'IR-${Date.now()}');
fs.writeFileSync('src/app/api/intakes/route.ts', apiContent, 'utf8');

let pageContent = fs.readFileSync('src/app/client/intake/page.tsx', 'utf8');
pageContent = pageContent.replace(/INT-\$\{Date\.now\(\)\}/g, 'IR-${Date.now()}');
fs.writeFileSync('src/app/client/intake/page.tsx', pageContent, 'utf8');
console.log('Fixed INT- references to IR-');
