const fs = require('fs');
const lines = fs.readFileSync('../Csupplier/src/pages/EventDetails.tsx', 'utf8').split('\n');
console.log(lines.slice(0, 30).join('\n'));
