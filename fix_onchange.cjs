const fs = require('fs');

const fixPage = (file) => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');

    // Replace the otherField exact matches with includes and check _sourceItemId
    code = code.replace(/if \(otherField\.key === f\.key\) return; \/\/ Skip self\s*const n = otherField\.name\.toLowerCase\(\);\s*if \(n === 'uom' \|\| n === 'unit of measure' \|\| n === 'unit'\) \{([\s\S]*?)\} else if \(n === 'category'\) \{([\s\S]*?)\} else if \(n === 'description' \|\| n === 'desc'\) \{([\s\S]*?)\} else if \(n === 'product code' \|\| n === 'item code'\) \{([\s\S]*?)\}/g,
    `if (otherField.key === f.key || otherField._sourceItemId !== f._sourceItemId) return;
                                        const n = (otherField.originalKey || otherField.name).toLowerCase();
                                        if (n.includes('uom') || n.includes('unit')) { $1} else if (n.includes('category')) { $2} else if (n.includes('desc')) { $3} else if (n.includes('code')) { $4}`);

    fs.writeFileSync(file, code, 'utf8');
}

fixPage('src/app/client/events/create/auction/page.tsx');
fixPage('src/app/client/events/create/single-stage/page.tsx');
console.log('Fixed onchange field matching');
