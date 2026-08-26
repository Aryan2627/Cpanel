const fs = require('fs');

function updateFile(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Add product matching to the else block
    code = code.replace(
        /if \(\(ln\.includes\('quantity'\) \|\| ln === 'qty'\) && !newData\[f\.key\]\)/,
        "if ((ln.includes('product') || ln.includes('item')) && !newData[f.key]) { newData[f.key] = item.values['Item Name']; changed = true; }\n                           else if ((ln.includes('quantity') || ln === 'qty') && !newData[f.key])"
    );

    fs.writeFileSync(file, code, 'utf8');
}

updateFile('src/app/client/events/create/single-stage/page.tsx');
updateFile('src/app/client/events/create/auction/page.tsx');
console.log('Added generic product field mapping');
