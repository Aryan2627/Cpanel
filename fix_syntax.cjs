const fs = require('fs');

const file = 'src/app/vendor/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Find Total Footer and the stray div
const badBlock = `          </div>

          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)',`;

const fixedBlock = `
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)',`;

if (code.includes(badBlock)) {
    code = code.replace(badBlock, fixedBlock);
    fs.writeFileSync(file, code, 'utf8');
    console.log('Fixed stray div');
} else {
    console.log('Stray div block not found');
}
