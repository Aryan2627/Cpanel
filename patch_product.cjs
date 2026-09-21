const fs = require('fs');
let c = fs.readFileSync('src/app/client/manage/products/create/page.tsx', 'utf8');

if (!c.includes('DynamicFields')) {
  c = c.replace(
    `import { useState, useEffect } from 'react';`,
    `import { useState, useEffect } from 'react';\nimport DynamicFields from '../../../../../components/DynamicFields';`
  );
  
  c = c.replace(
    `const [formData, setFormData] = useState({`,
    `const [customData, setCustomData] = useState<any>({});\n  const [formData, setFormData] = useState({`
  );

  // In handleSubmit, they do: const response = await fetch('/api/products', { method: 'POST', body: JSON.stringify(formData), ...
  c = c.replace(
    `body: JSON.stringify(formData)`,
    `body: JSON.stringify({ ...formData, customData })`
  );

  // insert dynamic fields just before <div className="mt-8 pt-6 border-t border-slate-200
  c = c.replace(
    `<div className="mt-8 pt-6 border-t border-slate-200`,
    `<div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Additional Specifications</h3>
            <DynamicFields formName="Product" value={customData} onChange={setCustomData} isDark={false} />
          </div>\n          <div className="mt-8 pt-6 border-t border-slate-200`
  );

  fs.writeFileSync('src/app/client/manage/products/create/page.tsx', c);
}
console.log('Product patched');
