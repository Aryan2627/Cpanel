const fs = require('fs');
const lines = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8').split('\n');
const s = lines.findIndex(l => l.includes("isSurrogateOpen &&"));
console.log(lines.slice(s - 2, s + 40).join('\n'));
