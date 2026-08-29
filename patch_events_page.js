const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

// Change `setBids(bidsData);` to `setBids(Array.isArray(bidsData) ? bidsData : []);`
code = code.replace(/setBids\(bidsData\);/, 'setBids(Array.isArray(bidsData) ? bidsData : []);');

fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
