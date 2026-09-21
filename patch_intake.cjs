const fs = require('fs');
let c = fs.readFileSync('src/app/client/intake/create/page.tsx', 'utf8');

if (!c.includes('DynamicFields')) {
  c = c.replace(
    `import { useIntake } from '../../../../context/IntakeContext';`,
    `import { useIntake } from '../../../../context/IntakeContext';\nimport DynamicFields from '../../../../components/DynamicFields';`
  );
  
  c = c.replace(
    `const [quantity, setQuantity] = useState<number | string>('');`,
    `const [quantity, setQuantity] = useState<number | string>('');\n  const [customData, setCustomData] = useState<any>({});`
  );
  
  // Also pass customData into the POST payload.
  // Look for: body: JSON.stringify({ title, category, quantity, ... })
  c = c.replace(
    `title,\n        category,\n        quantity: Number(quantity) || 1,\n        buyer: currentUser`,
    `title,\n        category,\n        quantity: Number(quantity) || 1,\n        buyer: currentUser,\n        customData`
  );

  // Insert the dynamic fields right before the submit button
  c = c.replace(
    `{/* Submit Section */}`,
    `<div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 20px 0' }}>Additional Information</h3>
            <DynamicFields formName="Intake" value={customData} onChange={setCustomData} isDark={false} />
          </div>\n          {/* Submit Section */}`
  );

  fs.writeFileSync('src/app/client/intake/create/page.tsx', c);
}
console.log('Intake patched');
