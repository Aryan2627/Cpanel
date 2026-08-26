const fs = require('fs');
const lines = fs.readFileSync('src/app/vendor/events/[id]/page.tsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('groupedFields'));
if (start !== -1) {
  console.log(lines.slice(start - 5, start + 30).join('\n'));
} else {
  console.log("Not found");
}
