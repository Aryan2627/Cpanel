const fs = require('fs');
let code = fs.readFileSync('src/app/client/TourButton.tsx', 'utf8');

// Replace generic button selectors with specific ones or remove element to make it center
code = code.replace(
  "{ element: 'button', popover: { title: 'Create New Request',",
  "{ element: '#tour-create-intake', popover: { title: 'Create New Request',"
);

// Remove all side and align properties so driver.js auto-positions perfectly!
code = code.replace(/,\s*side:\s*'[^']+'/g, '');
code = code.replace(/,\s*align:\s*'[^']+'/g, '');

fs.writeFileSync('src/app/client/TourButton.tsx', code, 'utf8');
console.log("TourButton positioning fixed");
