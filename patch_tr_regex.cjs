const fs = require('fs');
let code = fs.readFileSync('src/app/client/vendors/page.tsx', 'utf8');

const regex = /<tr className="vendor-row" onClick=\{\(\) => router\.push\(`\/client\/vendors\/\$\{vendor\.id\}`\)\} key=\{vendor\.id\}/;
const newTr = `<tr className="vendor-row" onClick={() => { if (vendor.status === 'Approval Pending') { setSelectedVendorForApproval(vendor); } else { router.push(\`/client/vendors/\${vendor.id}\`); } }} key={vendor.id}`;

if (code.match(regex)) {
    code = code.replace(regex, newTr);
    fs.writeFileSync('src/app/client/vendors/page.tsx', code, 'utf8');
    console.log("Successfully replaced onClick logic.");
} else {
    console.log("Regex didn't match.");
}
