const fs = require('fs');
const file = 'src/app/client/pr/page.tsx';
if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(
      /const items = \[\s*\{\s*id: `\$\{row\.refId\}-L1`, name: 'Dell XPS 15 Laptops', qty: 5, uom: 'EA', status: 'Pending'\s*\},[\s\S]*?\];/,
      `const items = [
        { id: \`\${row.refId}-L1\`, name: row.title || 'Product Request', qty: row.quantity || 1, uom: 'EA', status: 'Pending' }
      ];`
    );
    fs.writeFileSync(file, code, 'utf8');
    console.log('Fixed Dell XPS hardcoding in PR page.');
}
