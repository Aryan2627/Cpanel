const fs = require('fs');
const file = 'src/app/vendor/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// I'll make the calculation more robust by sorting fields by length descending so longer variable names are replaced first
const oldHandleChange = `             groupFields.forEach((gf: any) => {`;
const newHandleChange = `             const sortedFields = [...groupFields].sort((a, b) => (b.originalKey || b.key).length - (a.originalKey || a.key).length);
             sortedFields.forEach((gf: any) => {`;

code = code.replace(oldHandleChange, newHandleChange);

// I'll also update the calculateTotal to only sum calculation fields if they exist, or participant fields if no calculation exists for that group
const oldCalcTotal = `  const calculateTotal = () => {
    let total = 0;
    templateFields.forEach((f: any) => {
      if (f.type === 'number' && fieldData[f.key]) {
        total += parseFloat(fieldData[f.key]) || 0;
      }
    });
    return total;
  };`;

const newCalcTotal = `  const calculateTotal = () => {
    let total = 0;
    
    // Group fields by line item
    const groupedFields = new Map<any, any[]>();
    templateFields.forEach((f: any) => {
        const g = f._sourceItemId || 'default';
        if (!groupedFields.has(g)) groupedFields.set(g, []);
        groupedFields.get(g)!.push(f);
    });
    
    // For each group, sum ONLY Calculation fields if they exist. Otherwise sum Participant numeric fields.
    groupedFields.forEach(fields => {
      const calcFields = fields.filter(f => f.role?.toLowerCase() === 'calculation' && f.type === 'number');
      const targetFields = calcFields.length > 0 ? calcFields : fields.filter(f => f.role?.toLowerCase() === 'participant' && f.type === 'number');
      
      targetFields.forEach(f => {
        if (fieldData[f.key]) {
          total += parseFloat(fieldData[f.key]) || 0;
        }
      });
    });
    
    return total;
  };`;

code = code.replace(oldCalcTotal, newCalcTotal);

// Also apply the sortedFields fix to the useEffect!
const oldUseEffect = `             groupFields.forEach((gf: any) => {
               const vName = gf.originalKey || gf.key;
               if (expr.includes(vName)) {
                 let v = 0;
                 if (gf.role?.toLowerCase() === 'creator') v = Number(gf.defaultValue) || 0;
                 expr = expr.replace(new RegExp(\`\\\\b\${vName}\\\\b\`, 'g'), v.toString());
               }
             });`;
             
const newUseEffect = `             const sortedFields = [...groupFields].sort((a, b) => (b.originalKey || b.key).length - (a.originalKey || a.key).length);
             sortedFields.forEach((gf: any) => {
               const vName = gf.originalKey || gf.key;
               if (expr.includes(vName)) {
                 let v = 0;
                 if (gf.role?.toLowerCase() === 'creator') v = Number(gf.defaultValue) || 0;
                 expr = expr.replace(new RegExp(\`\\\\b\${vName}\\\\b\`, 'g'), v.toString());
               }
             });`;
             
code = code.replace(oldUseEffect, newUseEffect);

fs.writeFileSync(file, code, 'utf8');
console.log("Updated vendor calculation logic to be even more robust");
