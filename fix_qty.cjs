const fs = require('fs');

const files = [
  'src/app/client/events/create/auction/page.tsx',
  'src/app/client/events/create/single-stage/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    // Add Quantity mapping
    code = code.replace(/'UOM': parsed\[0\]\.uom \|\| 'EA'/,
    `'UOM': parsed[0].uom || 'EA',
                'Quantity': parsed[0].qty?.toString() || '1'`);

    fs.writeFileSync(file, code, 'utf8');
  }
});
