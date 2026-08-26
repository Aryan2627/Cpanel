const fs = require('fs');

// The issue: signIn from next-auth/react uses fetch internally and requires
// the NEXTAUTH_URL to match exactly. On Vercel, if the URL has www or different
// casing, cookies won't be set.
// Fix: use callbackUrl and let NextAuth handle the redirect properly.

let code = fs.readFileSync('src/app/signup/page.tsx', 'utf8');

// Replace the signIn + router.push with a proper signIn with redirect
const old = `      // Automatically log them in after registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      router.push('/client/intake');`;

const newCode = `      // Log them in — use redirect:true so NextAuth sets the session cookie properly
      await signIn('credentials', {
        redirect: true,
        email: formData.email,
        password: formData.password,
        callbackUrl: '/client/intake'
      });`;

code = code.replace(old, newCode);
fs.writeFileSync('src/app/signup/page.tsx', code, 'utf8');
console.log("Fixed signup signIn");

// Also fix the login page
let loginCode = fs.readFileSync('src/app/login/page.tsx', 'utf8');
const oldLogin = `      const res = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      if (res?.error) {
        throw new Error('Invalid email or password');
      }

      router.push('/client/intake');`;

const newLogin = `      const res = await signIn('credentials', {
        redirect: true,
        email: formData.email,
        password: formData.password,
        callbackUrl: '/client/intake'
      });
      
      if (res?.error) {
        throw new Error('Invalid email or password');
      }`;

loginCode = loginCode.replace(oldLogin, newLogin);
fs.writeFileSync('src/app/login/page.tsx', loginCode, 'utf8');
console.log("Fixed login signIn");
