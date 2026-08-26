const fs = require('fs');
const code = fs.readFileSync('src/app/vendor/events/[id]/page.tsx', 'utf8');
console.log(code.substring(code.indexOf('f.role?.toLowerCase() === \'creator\''), code.indexOf('f.role?.toLowerCase() === \'creator\'') + 500));
