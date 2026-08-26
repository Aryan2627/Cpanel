const fs = require('fs');
const file = 'src/app/vendor/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/f\.role === 'Calculation'/g, "f.role?.toLowerCase() === 'calculation'");
code = code.replace(/gf\.role === 'Creator'/g, "gf.role?.toLowerCase() === 'creator'");
code = code.replace(/f\.role === 'Creator'/g, "f.role?.toLowerCase() === 'creator'");

fs.writeFileSync(file, code, 'utf8');
console.log("Updated case-sensitivity");
