const fs = require('fs');
const lines = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8').split('\n');
const s = lines.findIndex(l => l.includes("surrogateData"));
console.log(lines.slice(s - 5, s + 35).join('\n'));
