const fs = require('fs');

['src/app/api/intakes/route.ts', 'src/app/api/products/route.ts'].forEach(file => {
  if (fs.existsSync(file)) {
    let c = fs.readFileSync(file, 'utf8');
    
    // Intake
    if (file.includes('intakes')) {
      c = c.replace(
        `const body = await request.json();`,
        `const body = await request.json();\n    const customData = body.customData || {};`
      );
      c = c.replace(
        `quantity: Number(body.quantity) || 1`,
        `quantity: Number(body.quantity) || 1,\n        customData`
      );
    }
    
    // Product
    if (file.includes('products')) {
      c = c.replace(
        `const body = await request.json();`,
        `const body = await request.json();\n    const customData = body.customData || {};`
      );
      c = c.replace(
        `description: body.description || ''`,
        `description: body.description || '',\n        customData`
      );
    }
    
    fs.writeFileSync(file, c);
  }
});
console.log('APIs patched');
