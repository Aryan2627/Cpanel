const fs = require('fs');
let content = fs.readFileSync('src/app/client/intake/create/page.tsx', 'utf8');
content = content.replace(/IR-210\$\\{Math\.floor\(Math\.random\(\) \* 10\) \+ 4\\}/, 'IR-${Math.floor(1000 + Math.random() * 9000)}');
fs.writeFileSync('src/app/client/intake/create/page.tsx', content, 'utf8');
console.log('Fixed random range');
