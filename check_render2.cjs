const fs = require('fs');
const lines = fs.readFileSync('src/app/client/events/create/single-stage/page.tsx', 'utf8').split('\n');
console.log(lines.slice(500, 530).join('\n'));
