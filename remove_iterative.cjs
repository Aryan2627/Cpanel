const fs = require('fs');
const file = 'src/app/client/intake/page.tsx';
let code = fs.readFileSync(file, 'utf8');

let lines = code.split('\n');
let newLines = [];
let skipNext = false;
for (let i = 0; i < lines.length; i++) {
    if (skipNext) {
        if (lines[i].includes('</td>')) skipNext = false;
        continue;
    }
    
    if (lines[i].includes('<td') && lines[i+1] && lines[i+1].includes('type="checkbox"')) {
        skipNext = true;
        continue;
    }
    
    newLines.push(lines[i]);
}

fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log('Removed checkboxes iteratively');
