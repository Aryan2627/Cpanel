const fs = require('fs');
const file = 'src/app/client/events/create/auction/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove lineItems declaration
code = code.replace(/  const \[lineItems, setLineItems\] = useState<any\[\]>\(\[\{ id: Date\.now\(\), values: \{\}, evaluatorId: '' \}\]\);\n/g, '');

// 2. Insert it at the top
code = code.replace(
    /const fromPR = searchParams\.get\('fromPR'\) === 'true';/,
    "const fromPR = searchParams.get('fromPR') === 'true';\n  const [lineItems, setLineItems] = useState<any[]>([{ id: Date.now(), values: {}, evaluatorId: '' }]);"
);

fs.writeFileSync(file, code, 'utf8');
console.log('Fixed TDZ in auction');
