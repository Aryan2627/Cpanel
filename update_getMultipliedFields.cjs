const fs = require('fs');

function updateGetMultipliedFields(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    code = code.replace(
        /const newField = \{ \.\.\.f, key: `\$\{item\.id\}_\$\{f\.key\}`, originalKey: f\.key, _sourceItemId: item\.id \};/,
        "const newField = { ...f, key: `${item.id}_${f.key}`, originalKey: f.key, originalName: f.name, _sourceItemId: item.id };"
    );
    
    fs.writeFileSync(file, code, 'utf8');
}

updateGetMultipliedFields('src/app/client/events/create/single-stage/page.tsx');
updateGetMultipliedFields('src/app/client/events/create/auction/page.tsx');
console.log('Updated getMultipliedFields');
