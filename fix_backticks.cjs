const fs = require('fs');
let code = fs.readFileSync('src/app/client/approvals/page.tsx', 'utf8');

code = code.replace(/\\`\/client\/po\/\\\$\{approval\.poId\}\\`/g, '`/client/po/${approval.poId}`');
code = code.replace(/\\`\/client\/events\/\\\$\{approval\.eventId\}\\`/g, '`/client/events/${approval.eventId}`');

fs.writeFileSync('src/app/client/approvals/page.tsx', code, 'utf8');
console.log('Fixed backticks');
