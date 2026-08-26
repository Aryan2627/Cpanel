const fs = require('fs');
let code = fs.readFileSync('src/app/vendor/events/[id]/page.tsx', 'utf8');

code = code.replace(/onBlur=\{\(e\) => e\.target\.style\.borderColor = '#334155'\}/g, 
`onBlur={(e) => e.target.style.borderColor = '#334155'}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}`);

fs.writeFileSync('src/app/vendor/events/[id]/page.tsx', code, 'utf8');
console.log('Fixed vendor page number scrolling');
