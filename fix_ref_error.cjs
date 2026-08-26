const fs = require('fs');
const file = 'src/app/client/events/create/auction/page.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
    /const initialTitle = searchParams\.get\('title'\) \|\| '';/,
    "const initialTitle = searchParams.get('title') || '';\n  const fromPR = searchParams.get('fromPR') === 'true';"
);
fs.writeFileSync(file, code, 'utf8');
console.log('Fixed ReferenceError for fromPR');
