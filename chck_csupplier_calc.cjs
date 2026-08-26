const fs = require('fs');
const file = '../Csupplier/src/pages/EventDetails.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const s = lines.findIndex(l => l.includes('if (!totalAmount) {'));
console.log(lines.slice(s-2, s+6).join('\n'));
