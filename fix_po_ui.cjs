const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

code = code.replace(/alert\(\`Purchase Order successfully generated for \$\{bid\.vendorName\}\! Redirecting\.\.\.\`\);/, 
`if (poData.requiresApproval) {
          alert(\`High Value Purchase Order (>\u20B9500,000) for \${bid.vendorName} requires Finance Approval. It has been routed to the Approvals Queue!\`);
        } else {
          alert(\`Purchase Order successfully generated for \${bid.vendorName}! Redirecting...\`);
        }`);

fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
console.log('Fixed PO UI logic for single award');
