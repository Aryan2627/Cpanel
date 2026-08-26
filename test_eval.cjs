const groupFields = [
  {"id":"b2","name":"CAR - Required Quantity","key":"1787761508721_target_quantity","type":"number","role":"Creator","required":true,"originalKey":"target_quantity","defaultValue":"10"},
  {"id":"b3","name":"CAR - Unit Price Bid","key":"1787761508721_unit_price","type":"number","role":"Participant","required":true,"originalKey":"unit_price"},
  {"id":"b4","name":"CAR - Total Extended Price","key":"1787761508721_total_price","type":"number","role":"Calculation","formula":"target_quantity * unit_price","originalKey":"total_price"}
];

let expr = "target_quantity * unit_price";
let next = { "1787761508721_unit_price": "50" };

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
