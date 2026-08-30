const fs = require('fs');

function removeWhiteBg(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // For login/signup: remove the white background style from brand-logo
    code = code.replace(/<div className="brand-logo" style=\{\{ background: '#fff', padding: '12px 24px', borderRadius: '12px', width: 'fit-content' \}\}>/, '<div className="brand-logo">');
    
    // For layout: remove the white background style
    code = code.replace(/<div style=\{\{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '6px 12px', borderRadius: '8px' \}\}>/, "<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>");

    fs.writeFileSync(filePath, code, 'utf8');
}

removeWhiteBg('C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/src/app/login/page.tsx');
removeWhiteBg('C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/src/app/signup/page.tsx');
removeWhiteBg('C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/src/app/client/layout.tsx');

console.log("Removed white background wrappers from Cpanel.");
