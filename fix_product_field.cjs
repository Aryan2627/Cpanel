const fs = require('fs');

const files = [
  'src/app/client/events/create/auction/page.tsx',
  'src/app/client/events/create/single-stage/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    // Make the product field read-only if fromPR is true
    code = code.replace(/<input\s*type="text"\s*list=\{`products-list-\$\{f\.key\}`\}\s*placeholder="Type to search products\.\.\."\s*value=\{creatorData\[f\.key\] \|\| ''\}/,
    `<input
                                  type="text"
                                  list={!fromPR ? \`products-list-\${f.key}\` : undefined}
                                  readOnly={fromPR}
                                  placeholder={fromPR ? "Auto-filled from PR" : "Type to search products..."}
                                  value={creatorData[f.key] || ''}`);

    code = code.replace(/style=\{glassInputStyle\}\s*onFocus=\{e => e\.currentTarget\.style\.boxShadow = '0 0 0 3px rgba\(59, 130, 246, 0\.2\)'\}\s*onBlur=\{e => e\.currentTarget\.style\.boxShadow = 'none'\}/,
    `style={fromPR ? { ...glassInputStyle, background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : glassInputStyle}
                                  onFocus={e => !fromPR && (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)')}
                                  onBlur={e => !fromPR && (e.currentTarget.style.boxShadow = 'none')}`);
                                  
    fs.writeFileSync(file, code, 'utf8');
    console.log('Fixed product field in', file);
  }
});
