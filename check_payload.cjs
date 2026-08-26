const fs = require('fs');
const lines = fs.readFileSync('src/app/client/events/create/single-stage/page.tsx', 'utf8').split('\n');
const s = lines.findIndex(l => l.includes("fetch('/api/events'"));
console.log(lines.slice(s - 20, s + 5).join('\n'));
