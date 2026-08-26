const fs = require('fs');
const file = 'src/app/client/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCalc = `      let calculatedAmount = 0;
      templateFields.forEach((f: any) => {
        if (f.type === 'number') {
          calculatedAmount += parseFloat(surrogateData[f.key]) || 0;
        }
      });`;

const newCalc = `      let calculatedAmount = 0;
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
          if (surrogateData[f.key]) {
            calculatedAmount += parseFloat(surrogateData[f.key]) || 0;
          }
        });
      });`;

code = code.replace(oldCalc, newCalc);
fs.writeFileSync(file, code, 'utf8');
console.log("Fixed surrogate calculateAmount");
