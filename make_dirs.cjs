const fs = require('fs');
const dirs = [
  'src/app/client/license/summary',
  'src/app/client/license/products',
  'src/app/client/license/publishers',
  'src/app/client/license/all',
  'src/app/client/license/allocations',
  'src/app/client/license/recommendations',
  'src/app/client/license/points',
  'src/app/client/license/expiry/maintenance',
  'src/app/client/license/expiry/contracts',
  'src/app/client/license/expiry/payments'
];

dirs.forEach(d => {
  fs.mkdirSync(d, { recursive: true });
});
console.log("Directories created.");
