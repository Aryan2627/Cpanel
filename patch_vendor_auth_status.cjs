const fs = require('fs');
let code = fs.readFileSync('src/app/api/vendor-auth/route.ts', 'utf8');

const regex = /if \(vendor\.status !== 'Onboarding in Progress'\) \{\s*return NextResponse\.json\(\{ error: 'Password login is only available for vendors onboarding in progress\.' \}, \{ status: 403, headers: corsHeaders \}\);\s*\}/;

const replacement = `if (vendor.status !== 'Onboarding in Progress' && vendor.status !== 'Pending Onboarding' && vendor.status !== 'Approval Pending') {
        return NextResponse.json({ error: 'Password login is only available during the onboarding phase.' }, { status: 403, headers: corsHeaders });
      }`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/app/api/vendor-auth/route.ts', code, 'utf8');
    console.log("Successfully patched vendor auth to accept all pending states.");
} else {
    console.log("Regex didn't match.");
}
