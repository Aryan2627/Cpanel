const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

code = code.replace(/alert\('Successfully generated Purchase Orders for the Split Award!'\);/, 
`alert('Split Award Complete! Note: Any Purchase Orders exceeding \u20B9500,000 have been automatically routed to the Finance Director for mandatory compliance approval before being sent to the vendor.');`);

fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
console.log('Fixed PO UI logic for split award');
