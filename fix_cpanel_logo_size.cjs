const fs = require('fs');

function fixSize(filePath, w, h) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Replace the problematic img tag
    const regex = /<img src="\/logo\.png" alt="ProcGen Logo" className="[^"]*" style=\{\{ filter: "[^"]*" \}\} \/>/g;
    
    // Some tags might not have the exact spacing, so let's just do a more flexible regex:
    const flexibleRegex = /<img src="\/logo\.png".*?\/>/g;
    
    code = code.replace(flexibleRegex, `<img src="/logo.png" alt="ProcGen Logo" style={{ width: '${w}px', height: '${h}px', objectFit: 'contain', filter: 'contrast(1.2) drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))' }} />`);
    
    fs.writeFileSync(filePath, code, 'utf8');
}

fixSize('C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/src/app/client/layout.tsx', 40, 40);
fixSize('C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/src/app/login/page.tsx', 64, 64);
fixSize('C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/src/app/signup/page.tsx', 64, 64);

console.log("Forced explicit inline sizes for Cpanel logos.");
