const fs = require('fs');
const file = '../Csupplier/src/pages/EventDetails.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldHandleChange = `  const handleInputChange = (key: string, value: string) => {
    const numVal = parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [key]: isNaN(numVal) ? value : numVal
    }));
  };`;

const newHandleChange = `  const handleInputChange = (key: string, value: string) => {
    const numVal = parseFloat(value);
    const resolvedVal = isNaN(numVal) ? value : numVal;
    
    setFormData(prev => {
      const next = { ...prev, [key]: resolvedVal };
      
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
             next[f.key] = Number(result) || 0;
           } catch(e) {}
        }
      });
      return next;
    });
  };`;

code = code.replace(oldHandleChange, newHandleChange);

const calcUseEffect = `
  // Auto-calculate formula fields on mount if they haven't been calculated yet
  useEffect(() => {
    if (templateFields.length > 0 && Object.keys(formData).length > 0) {
      let hasCalc = false;
      const next = { ...formData };
      let changed = false;
      
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
                 else v = Number(next[gf.key]) || 0;
                 expr = expr.replace(new RegExp(\`\\\\b\${vName}\\\\b\`, 'g'), v.toString());
               }
             });
             // eslint-disable-next-line no-new-func
             const result = new Function('return ' + expr)();
             const newResult = Number(result) || 0;
             if (next[f.key] !== newResult) {
                 next[f.key] = newResult;
                 changed = true;
             }
           } catch(e) {}
        }
      });
      if (changed) {
        setFormData(next);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateFields]); // Only run when template fields change (which happens on event load)
`;

const insertPos = code.indexOf('const enableESG =');
code = code.substring(0, insertPos) + calcUseEffect + '\n  ' + code.substring(insertPos);

fs.writeFileSync(file, code, 'utf8');
console.log("Injected logic into Csupplier");
