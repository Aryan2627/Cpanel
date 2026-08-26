const fs = require('fs');
const lines = fs.readFileSync('src/app/vendor/events/[id]/page.tsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('<table style={{ width'));
console.log(lines.slice(start - 2, start + 70).join('\n'));
