const fs = require('fs');
let code = fs.readFileSync('src/app/api/vendor-onboarding/route.ts', 'utf8');

const validationLogic = `
    const { 
      companyCode, tradeLicense, taxId, city, phone, type,
      entityType, registeredAddress, contactPerson, pan, gstin, cin, msme,
      productsOffered, productCategory, bankAccountName, bankAccountNumber, bankIfsc,
      companyProfile, certifications, previousExperience,
      documents
    } = data;

    // Backend Validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const bankAccRegex = /^\\d{9,18}$/;

    if (pan && !panRegex.test(pan.toUpperCase())) return NextResponse.json({ error: 'Invalid PAN format.' }, { status: 400 });
    if (gstin && !gstinRegex.test(gstin.toUpperCase())) return NextResponse.json({ error: 'Invalid GSTIN format.' }, { status: 400 });
    if (bankIfsc && !ifscRegex.test(bankIfsc.toUpperCase())) return NextResponse.json({ error: 'Invalid IFSC format.' }, { status: 400 });
    if (bankAccountNumber && !bankAccRegex.test(bankAccountNumber)) return NextResponse.json({ error: 'Invalid Bank Account format.' }, { status: 400 });
`;

code = code.replace(/const \{\s*companyCode.*?\s*\} = data;/s, validationLogic);

fs.writeFileSync('src/app/api/vendor-onboarding/route.ts', code, 'utf8');
console.log("Added backend validation to Cpanel.");
