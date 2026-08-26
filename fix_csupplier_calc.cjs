const fs = require('fs');
const file = '../Csupplier/src/pages/EventDetails.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCalc = `      if (!totalAmount) {
        totalAmount = Object.values(formData).reduce((acc: number, val: any) => acc + (parseFloat(val) || 0), 0);
      }`;

const newCalc = `      if (!totalAmount) {
        let calcAmount = 0;
        const groupedFields = new Map<any, any[]>();
        templateFields.forEach((f: any) => {
            const g = f._sourceItemId || 'default';
            if (!groupedFields.has(g)) groupedFields.set(g, []);
            groupedFields.get(g)!.push(f);
        });
        
        groupedFields.forEach(fields => {
          const calcFields = fields.filter(f => f.role?.toLowerCase() === 'calculation' && f.type === 'number');
          const targetFields = calcFields.length > 0 ? calcFields : fields.filter(f => f.role?.toLowerCase() === 'participant' && f.type === 'number');
          
          targetFields.forEach(f => {
            if (formData[f.key]) {
              calcAmount += parseFloat(formData[f.key] as string) || 0;
            }
          });
        });
        totalAmount = calcAmount;
      }`;

if (code.includes(oldCalc)) {
    code = code.replace(oldCalc, newCalc);
    fs.writeFileSync(file, code, 'utf8');
    console.log("Fixed Csupplier calculateAmount");
} else {
    console.log("Could not find oldCalc");
}
