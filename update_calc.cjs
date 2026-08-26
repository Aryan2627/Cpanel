const fs = require('fs');

const file = 'src/app/vendor/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldHandleChange = `  const handleFieldChange = (key: string, val: string) => {
    setFieldData(prev => ({ ...prev, [key]: val }));
  };`;

const newHandleChange = `  const handleFieldChange = (key: string, val: string) => {
    setFieldData(prev => {
      const next = { ...prev, [key]: val };
      
      // Auto-calculate formula fields
      templateFields.forEach((f: any) => {
        if (f.role === 'Calculation' && f.formula) {
           const groupId = f._sourceItemId || 'default';
           const groupFields = templateFields.filter((tf: any) => (tf._sourceItemId || 'default') === groupId);
           
           try {
             let expr = f.formula;
             groupFields.forEach((gf: any) => {
               const vName = gf.originalKey || gf.key;
               if (expr.includes(vName)) {
                 let v = 0;
                 if (gf.role === 'Creator') v = Number(gf.defaultValue) || 0;
                 else v = Number(next[gf.key]) || 0;
                 expr = expr.replace(new RegExp(\`\\\\b\${vName}\\\\b\`, 'g'), v.toString());
               }
             });
             // eslint-disable-next-line no-new-func
             const result = new Function('return ' + expr)();
             next[f.key] = (Number(result) || 0).toString();
           } catch(e) {}
        }
      });
      
      return next;
    });
  };`;

if (code.includes(oldHandleChange)) {
    code = code.replace(oldHandleChange, newHandleChange);
} else {
    console.log("oldHandleChange not found");
}

const oldInput = `                      ) : (
                        <input 
                          type={f.type === 'number' ? 'number' : 'text'}
                          value={fieldData[f.key] || ''}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                          placeholder={\`Enter \${f.type}...\`}
                          style={{ width: '100%', padding: '12px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '1rem', fontWeight: 500, outline: 'none', transition: 'border-color 0.2s' }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#334155'}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                      )}`;

const newInput = `                      ) : f.role === 'Calculation' ? (
                        <div style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#38bdf8', fontSize: '1rem', fontWeight: 700 }}>
                          {Number(fieldData[f.key] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      ) : (
                        <input 
                          type={f.type === 'number' ? 'number' : 'text'}
                          value={fieldData[f.key] || ''}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                          placeholder={\`Enter \${f.type}...\`}
                          style={{ width: '100%', padding: '12px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '1rem', fontWeight: 500, outline: 'none', transition: 'border-color 0.2s' }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#334155'}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                      )}`;

if (code.includes(oldInput)) {
    code = code.replace(oldInput, newInput);
} else {
    console.log("oldInput not found");
}

fs.writeFileSync(file, code, 'utf8');
console.log("Updated vendor calculation logic");
