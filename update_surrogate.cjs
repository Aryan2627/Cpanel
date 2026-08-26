const fs = require('fs');
const file = 'src/app/client/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const s = code.indexOf('const handleSurrogateSubmit = async () => {');
if (s !== -1) {
    const handleFieldChange = `  const handleSurrogateChange = (key: string, val: string) => {
    setSurrogateData(prev => {
      const next = { ...prev, [key]: val };
      
      templateFields.forEach((f: any) => {
        if (f.role?.toLowerCase() === 'calculation' && f.formula) {
           const groupId = f._sourceItemId || 'default';
           const groupFields = templateFields.filter((tf: any) => (tf._sourceItemId || 'default') === groupId);
           try {
             let expr = f.formula;
             const sortedFields = [...groupFields].sort((a, b) => (b.originalKey || b.key).length - (a.originalKey || a.key).length);
             sortedFields.forEach((gf: any) => {
               const vName = gf.originalKey || gf.key;
               if (expr.includes(vName)) {
                 let v = 0;
                 if (gf.role?.toLowerCase() === 'creator') v = Number(gf.defaultValue) || 0;
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
  };
`;
    code = code.substring(0, s) + handleFieldChange + '\n' + code.substring(s);
}

// Now replace surrogateData update calls in the JSX
code = code.replace(/setSurrogateData\(\{\s*\.\.\.surrogateData,\s*\[f\.key\]:\s*e\.target\.value\s*\}\)/g, "handleSurrogateChange(f.key, e.target.value)");

// Now update the UI render for the proxy bid
const oldRender = `{f.type === 'textarea' ? (
                      <textarea 
                        value={surrogateData[f.key] || ''}
                        onChange={(e) => setSurrogateData({ ...surrogateData, [f.key]: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', minHeight: '60px' }}
                      />
                    ) : (
                      <input 
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={surrogateData[f.key] || ''}
                        onChange={(e) => setSurrogateData({ ...surrogateData, [f.key]: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
                      />
                    )}`;

const newRender = `
                    {f.role?.toLowerCase() === 'creator' ? (
                      <div style={{ width: '100%', padding: '8px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#64748b', fontSize: '0.9rem', cursor: 'not-allowed' }}>
                        {f.type === 'number' ? Number(f.defaultValue || 0).toLocaleString() : (f.defaultValue || '-')}
                      </div>
                    ) : f.role?.toLowerCase() === 'calculation' ? (
                      <div style={{ width: '100%', padding: '8px 12px', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '6px', color: '#0369a1', fontSize: '0.9rem', fontWeight: 600 }}>
                        {Number(surrogateData[f.key] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    ) : f.type === 'textarea' ? (
                      <textarea 
                        value={surrogateData[f.key] || ''}
                        onChange={(e) => handleSurrogateChange(f.key, e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', minHeight: '60px' }}
                      />
                    ) : (
                      <input 
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={surrogateData[f.key] || ''}
                        onChange={(e) => handleSurrogateChange(f.key, e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
                      />
                    )}`;

code = code.replace(oldRender, newRender);

// Also need a useEffect to init calculations on mount of the surrogate modal
const modalOpenEffect = `
  useEffect(() => {
    if (isSurrogateOpen && templateFields.length > 0) {
      const initData: any = {};
      let hasCalc = false;
      templateFields.forEach((f: any) => {
        if (f.role?.toLowerCase() === 'calculation' && f.formula) {
           hasCalc = true;
           const groupId = f._sourceItemId || 'default';
           const groupFields = templateFields.filter((tf: any) => (tf._sourceItemId || 'default') === groupId);
           try {
             let expr = f.formula;
             const sortedFields = [...groupFields].sort((a, b) => (b.originalKey || b.key).length - (a.originalKey || a.key).length);
             sortedFields.forEach((gf: any) => {
               const vName = gf.originalKey || gf.key;
               if (expr.includes(vName)) {
                 let v = 0;
                 if (gf.role?.toLowerCase() === 'creator') v = Number(gf.defaultValue) || 0;
                 expr = expr.replace(new RegExp(\`\\\\b\${vName}\\\\b\`, 'g'), v.toString());
               }
             });
             // eslint-disable-next-line no-new-func
             const result = new Function('return ' + expr)();
             initData[f.key] = (Number(result) || 0).toString();
           } catch(e) {}
        }
      });
      if (hasCalc) setSurrogateData(initData);
      else setSurrogateData({});
    }
  }, [isSurrogateOpen, templateFields]);
`;
const effectPos = code.indexOf('const parsedParticipants = useMemo');
code = code.substring(0, effectPos) + modalOpenEffect + '\n' + code.substring(effectPos);

fs.writeFileSync(file, code, 'utf8');
console.log("Updated surrogate logic");
