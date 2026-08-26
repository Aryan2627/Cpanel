const fs = require('fs');
let file = 'src/app/client/intake/create/page.tsx';
if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/type="number"/g, 'type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()}');
    fs.writeFileSync(file, code, 'utf8');
    console.log('Fixed intake create scroll');
}
