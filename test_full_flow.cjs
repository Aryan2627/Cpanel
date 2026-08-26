const groupFields = [
  {"id":"b2","name":"Required Quantity","key":"1787761508721_target_quantity","type":"number","role":"Creator","formula":"","required":true,"originalKey":"target_quantity","defaultValue":"10"},
  {"id":"b3","name":"Unit Price Bid","key":"1787761508721_unit_price","type":"number","role":"Participant","required":true,"originalKey":"unit_price"},
  {"id":"b4","name":"Total Extended Price","key":"1787761508721_total_price","type":"number","role":"Calculation","formula":"target_quantity * unit_price","originalKey":"total_price"}
];

let fieldData = {};

let initData = {};
let hasCalc = false;
groupFields.forEach((f) => {
  if (f.role === 'Calculation' && f.formula) {
     hasCalc = true;
     let expr = f.formula;
     groupFields.forEach((gf) => {
       const vName = gf.originalKey || gf.key;
       if (expr.includes(vName)) {
         let v = 0;
         if (gf.role === 'Creator') v = Number(gf.defaultValue) || 0;
         expr = expr.replace(new RegExp(`\\b${vName}\\b`, 'g'), v.toString());
       }
     });
     initData[f.key] = (Number(new Function('return ' + expr)()) || 0).toString();
  }
});
if (hasCalc) fieldData = initData;

console.log("Initial fieldData:", fieldData);

// Vendor types "50"
let next = { ...fieldData, "1787761508721_unit_price": "50" };
groupFields.forEach((f) => {
  if (f.role === 'Calculation' && f.formula) {
     let expr = f.formula;
     groupFields.forEach((gf) => {
       const vName = gf.originalKey || gf.key;
       if (expr.includes(vName)) {
         let v = 0;
         if (gf.role === 'Creator') v = Number(gf.defaultValue) || 0;
         else v = Number(next[gf.key]) || 0;
         expr = expr.replace(new RegExp(`\\b${vName}\\b`, 'g'), v.toString());
       }
     });
     next[f.key] = (Number(new Function('return ' + expr)()) || 0).toString();
  }
});

console.log("Next fieldData:", next);
