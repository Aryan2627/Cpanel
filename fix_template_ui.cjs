const fs = require('fs');

let file = 'src/app/client/manage/templates/create/page.tsx';
if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    // Title & Description
    code = code.replace(/Advanced Template Builder/, 'Create Template');
    code = code.replace(/Design smart procurement forms with live preview/, 'Define fields for your procurement template');

    // Save button styling
    code = code.replace(/background: 'linear-gradient\(135deg, #2563eb 0%, #1d4ed8 100%\)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba\(37, 99, 235, 0\.2\)'/, 
    "background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500");

    // Cancel button styling
    code = code.replace(/border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', borderRadius: '8px', cursor: 'pointer', fontWeight: 500/,
    "border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', borderRadius: '4px', cursor: 'pointer', fontWeight: 500");

    // Remove AI button
    code = code.replace(/<button[\s\S]*?onClick=\{handleGenerateAI\}[\s\S]*?<\/button>/, '');
    
    // Remove ESG toggle UI
    code = code.replace(/<div style=\{\{ display: 'flex', alignItems: 'center', gap: '8px' \}\}>\s*<input type="checkbox" id="esg-toggle" checked=\{enableESG\} onChange=\{e => setEnableESG\(e\.target\.checked\)\} style=\{\{ cursor: 'pointer' \}\} \/>\s*<label htmlFor="esg-toggle" style=\{\{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0\.9rem', fontWeight: 600, color: '#16a34a', cursor: 'pointer' \}\}>\s*<Leaf size=\{16\} \/> Enable ESG Carbon Calculation\s*<\/label>\s*<\/div>/, '');

    // Cleanup AI and ESG state imports if we want, but it's fine.

    // Container styling adjustments for normal look
    code = code.replace(/borderRadius: '12px'/g, "borderRadius: '4px'");
    code = code.replace(/borderRadius: '8px'/g, "borderRadius: '4px'");
    code = code.replace(/borderRadius: '6px'/g, "borderRadius: '4px'");
    
    // Change "Template Configuration" to just regular text
    code = code.replace(/<h2 style=\{\{ margin: 0, fontSize: '1\.1rem', color: '#1e293b' \}\}>Template Configuration<\/h2>/, 
    "<h2 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>Template Configuration</h2>");

    fs.writeFileSync(file, code, 'utf8');
}
