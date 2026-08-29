const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!code.includes('onboardingData')) {
    code = code.replace(
        'createdAt      DateTime      @default(now())',
        'onboardingData Json?\n  createdAt      DateTime      @default(now())'
    );
    fs.writeFileSync('prisma/schema.prisma', code, 'utf8');
    console.log("Added onboardingData Json? to Vendor model.");
} else {
    console.log("onboardingData already exists.");
}
