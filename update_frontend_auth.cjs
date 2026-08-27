const fs = require('fs');

function updateLogin(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace import
  code = code.replace("import { signIn } from 'next-auth/react';", "");
  
  // Find the signIn block in login
  const oldLoginRegex = /const res = await signIn\('credentials',\s*\{\s*redirect:\s*true,\s*email:\s*formData\.email,\s*password:\s*formData\.password,\s*callbackUrl:\s*'\/client\/intake'\s*\}\);[\s\S]*?if\s*\(res\?\.error\)\s*\{\s*throw new Error\('Invalid email or password'\);\s*\}/;
  
  const newLogin = `
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid email or password');
      }
      
      router.push('/client/intake');
  `;
  
  code = code.replace(oldLoginRegex, newLogin);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log("Updated", filePath);
}

function updateSignup(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace import
  code = code.replace("import { signIn } from 'next-auth/react';", "");
  
  // Find the signIn block in signup
  const oldSignupRegex = /\/\/ Log them in[^\n]*\n\s*await signIn\('credentials',\s*\{\s*redirect:\s*true,\s*email:\s*formData\.email,\s*password:\s*formData\.password,\s*callbackUrl:\s*'\/client\/intake'\s*\}\);/;
  
  const newSignup = `
      // Log them in via our custom endpoint
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      
      if (!loginRes.ok) {
        throw new Error('Registration successful but auto-login failed. Please log in manually.');
      }
      
      router.push('/client/intake');
  `;
  
  code = code.replace(oldSignupRegex, newSignup);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log("Updated", filePath);
}

try {
  updateLogin('src/app/login/page.tsx');
  updateSignup('src/app/signup/page.tsx');
} catch (e) {
  console.error("Error updating files:", e);
}
