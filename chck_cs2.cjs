const fs = require('fs');
const lines = fs.readFileSync('../Csupplier/src/pages/EventDetails.tsx', 'utf8').split('\n');
const s = lines.findIndex(l => l.includes('setFormData('));
console.log(lines.slice(s - 5, s + 30).join('\n'));
