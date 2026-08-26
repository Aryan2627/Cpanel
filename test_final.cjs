const groupFields = [
  {"id":"b2","name":"Required Quantity","key":"target_quantity","type":"number","role":"Creator","formula":"","required":true,"section":"General","enableESG":true,"defaultValue":"100"},
  {"id":"b3","name":"Unit Price Bid","key":"unit_price","type":"number","role":"Participant","required":true,"section":"General","enableESG":true},
  {"id":"b4","name":"Total Extended Price","key":"total_price","type":"number","role":"Calculation","formula":"target_quantity * unit_price","required":false,"section":"General","enableESG":true}
];

let expr = "target_quantity * unit_price";
let next = { "unit_price": "50" };

const sortedFields = [...groupFields].sort((a, b) => (b.originalKey || b.key).length - (a.originalKey || a.key).length);
sortedFields.forEach((gf) => {
   const vName = gf.originalKey || gf.key;
   if (expr.includes(vName)) {
     let v = 0;
     if (gf.role?.toLowerCase() === 'creator') v = Number(gf.defaultValue) || 0;
     else v = Number(next[gf.key]) || 0;
     expr = expr.replace(new RegExp(`\\b${vName}\\b`, 'g'), v.toString());
   }
});
console.log(expr);
console.log(new Function('return ' + expr)());
