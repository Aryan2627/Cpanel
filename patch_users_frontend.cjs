const fs = require('fs');
let code = fs.readFileSync('src/app/client/manage/users/page.tsx', 'utf8');

// Filter phone input to only numbers
code = code.replace(
  'onChange={e => setFormData({ ...formData, phone: e.target.value })}',
  'onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\\D/g, \'\') })}'
);

// Alert the error if the backend rejects duplicate
code = code.replace(
  'if (!res.ok) throw new Error(\'Failed to save\');',
  'if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || \'Failed to save\'); }'
);

fs.writeFileSync('src/app/client/manage/users/page.tsx', code, 'utf8');
console.log("Patched users frontend");
