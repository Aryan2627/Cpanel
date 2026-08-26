const fs = require('fs');
const file = '../Csupplier/src/pages/EventDetails.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update handleInputChange
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

// Now update the initialization inside the fetch promise logic
// There's a `setFormData(initialData)` block. I should evaluate the formulas BEFORE setting it.
const oldSetInitial = `            setFormData(initialData);
            setLoading(false);`;

const newSetInitial = `            
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
                       else v = Number(initialData[gf.key]) || 0;
                       expr = expr.replace(new RegExp(\`\\\\b\${vName}\\\\b\`, 'g'), v.toString());
                     }
                   });
                   // eslint-disable-next-line no-new-func
                   const result = new Function('return ' + expr)();
                   initialData[f.key] = Number(result) || 0;
                 } catch(e) {}
              }
            });
            
            setFormData(initialData);
            setLoading(false);`;

// Wait, templateFields is a useMemo that depends on `event`.
// If I put this inside the `useEffect` that fetches the event, `templateFields` DOES NOT EXIST YET inside that closure, because `templateFields` is derived from `event` after state update!
// Let's add a separate useEffect to handle calculation initialization.
