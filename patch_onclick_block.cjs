const fs = require('fs');
let code = fs.readFileSync('src/app/client/vendors/page.tsx', 'utf8');

const regex = /if \(vendor\.status === 'Approval Pending'\) \{ setSelectedVendorForApproval\(vendor\); \} else \{ router\.push\(\`\/client\/vendors\/\$\{vendor\.id\}\`\); \}/;
const replacement = "if (vendor.status === 'Approval Pending') { setSelectedVendorForApproval(vendor); } else if (vendor.status === 'Onboarding in Progress' || vendor.status === 'Pending Onboarding') { alert('This vendor is still filling out their onboarding form. You can approve them once they submit it.'); } else { router.push(`/client/vendors/${vendor.id}`); }";

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/app/client/vendors/page.tsx', code, 'utf8');
    console.log("Successfully patched onClick to handle pending states.");
} else {
    console.log("Regex didn't match.");
}
