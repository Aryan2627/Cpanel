const groupFields = [
  {"id":"b2","name":"Required Quantity","key":"target_quantity","type":"number","role":"Creator","formula":"","required":true,"defaultValue":"10"},
  {"id":"b3","name":"Unit Price Bid","key":"unit_price","type":"number","role":"Participant","required":true},
  {"id":"b4","name":"Total Extended Price","key":"total_price","type":"number","role":"Calculation","formula":"target_quantity * unit_price"}
];

let expr = "target_quantity * unit_price";
let next = { "unit_price": "50" };

groupFields.forEach((gf) => {
   const vName = gf.originalKey || gf.key;
   if (expr.includes(vName)) {
     let v = 0;
     if (gf.role === 'Creator') v = Number(gf.defaultValue) || 0;
     else v = Number(next[gf.key]) || 0;
     expr = expr.replace(new RegExp(`\\b${vName}\\b`, 'g'), v.toString());
   }
});
console.log(expr);
console.log(new Function('return ' + expr)());
