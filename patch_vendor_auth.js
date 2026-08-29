const fs = require('fs');
let code = fs.readFileSync('src/app/api/vendor-auth/route.ts', 'utf8');

const jwtSignIndex = code.indexOf('const token = jwt.sign(');
const newActionBlock = `
    else if (action === 'password_login') {
      const { password } = data;
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400, headers: corsHeaders });
      }

      if (vendor.status !== 'Onboarding in Progress') {
        return NextResponse.json({ error: 'Password login is only available for vendors onboarding in progress.' }, { status: 403, headers: corsHeaders });
      }

      const expectedPassword = vendor.email.substring(0, 3).toLowerCase() + '@26';
      
      if (password !== expectedPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401, headers: corsHeaders });
      }

      const token = jwt.sign(
        { id: vendor.id, email: vendor.email, phone: vendor.phone, name: vendor.name, status: vendor.status },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({ vendor, token }, { status: 200, headers: corsHeaders });
    }
`;

code = code.replace(/else if \(action === 'verify'\) \{[\s\S]*?return NextResponse\.json\(\{ vendor, token \}, \{ status: 200, headers: corsHeaders \}\);\s*\}/, (match) => {
    // We also need to add 'status' to the verify action JWT
    let modifiedMatch = match.replace(
        /\{ id: vendor\.id, email: vendor\.email, phone: vendor\.phone, name: vendor\.name \}/,
        `{ id: vendor.id, email: vendor.email, phone: vendor.phone, name: vendor.name, status: vendor.status }`
    );
    return modifiedMatch + newActionBlock;
});

fs.writeFileSync('src/app/api/vendor-auth/route.ts', code, 'utf8');
console.log("Updated vendor-auth API.");
