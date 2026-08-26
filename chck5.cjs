const fs = require('fs');
const lines = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8').split('\n');
const s = lines.findIndex(l => l.includes('f.role === '));
if (s !== -1) {
  console.log(lines.slice(s - 5, s + 30).join('\n'));
} else {
  console.log("Not found");
}
