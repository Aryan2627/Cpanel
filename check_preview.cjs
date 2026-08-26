const fs = require('fs');
const lines = fs.readFileSync('src/app/client/events/create/single-stage/page.tsx', 'utf8').split('\n');
console.log(lines.slice(510, 560).join('\n'));
