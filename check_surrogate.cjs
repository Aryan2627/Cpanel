const fs = require('fs');
const lines = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8').split('\n');
const s = lines.findIndex(l => l.includes("Surrogate Bid"));
console.log(lines.slice(s, s + 35).join('\n'));
