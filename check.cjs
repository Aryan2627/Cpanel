const fs = require('fs');
const lines = fs.readFileSync('src/app/vendor/events/[id]/page.tsx', 'utf8').split('\n');
const s = lines.findIndex(l => l.includes("=== 'calculation' ? ("));
console.log(lines.slice(Math.max(0, s - 5), s + 10).join('\n'));
