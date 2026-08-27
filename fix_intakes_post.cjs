const fs = require('fs');
let code = fs.readFileSync('src/app/api/intakes/route.ts', 'utf8');

// If POST doesn't use getTenantId, add it.
if (!code.includes('const orgId = await getTenantId()') || !code.includes('organizationId: orgId') && code.includes('POST')) {
  // Let's just do a string replacement for POST
  const oldPost = `    const newIntake = await prisma.intake.create({
      data: {`;
  
  const newPost = `    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const newIntake = await prisma.intake.create({
      data: {
        organizationId: orgId,`;
        
  code = code.replace(oldPost, newPost);
  fs.writeFileSync('src/app/api/intakes/route.ts', code, 'utf8');
  console.log("Updated intakes POST route");
} else {
  console.log("intakes POST route already has orgId");
}
