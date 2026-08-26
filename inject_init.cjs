const fs = require('fs');
const file = 'src/app/vendor/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const searchStr = `  const calculateTotal = () => {`;
const injectStr = `  useEffect(() => {
    if (templateFields.length > 0 && Object.keys(fieldData).length === 0) {
      const initData: any = {};
      let hasCalc = false;
      templateFields.forEach((f: any) => {
        if (f.role === 'Calculation' && f.formula) {
           hasCalc = true;
           const groupId = f._sourceItemId || 'default';
           const groupFields = templateFields.filter((tf: any) => (tf._sourceItemId || 'default') === groupId);
           try {
             let expr = f.formula;
             groupFields.forEach((gf: any) => {
               const vName = gf.originalKey || gf.key;
               if (expr.includes(vName)) {
                 let v = 0;
                 if (gf.role === 'Creator') v = Number(gf.defaultValue) || 0;
                 expr = expr.replace(new RegExp(\`\\\\b\${vName}\\\\b\`, 'g'), v.toString());
               }
             });
             // eslint-disable-next-line no-new-func
             const result = new Function('return ' + expr)();
             initData[f.key] = (Number(result) || 0).toString();
           } catch(e) {}
        }
      });
      if (hasCalc) setFieldData(initData);
    }
  }, [templateFields]);

  const calculateTotal = () => {`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, injectStr);
    fs.writeFileSync(file, code, 'utf8');
    console.log("Injected initial calculation logic");
} else {
    console.log("calculateTotal not found");
}
