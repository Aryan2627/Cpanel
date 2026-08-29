const fs = require('fs');

// Patch vendors
let vendorsCode = fs.readFileSync('src/app/client/vendors/page.tsx', 'utf8');
vendorsCode = vendorsCode.replace(
    "const handleSubmit = async () => {\n    if (!formData.name || !formData.email) {\n      alert('Please fill out all required fields.');\n      return;\n    }",
    `const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill out all required fields.');
      return;
    }
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }`
);
fs.writeFileSync('src/app/client/vendors/page.tsx', vendorsCode, 'utf8');

// Patch users
let usersCode = fs.readFileSync('src/app/client/manage/users/page.tsx', 'utf8');
usersCode = usersCode.replace(
    "const handleCreate = async () => {\n    if (!formData.name || !formData.email || !formData.phone || !formData.role) {\n      alert(\"Name, Email, Phone, and Role are required.\");\n      return;\n    }",
    `const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      alert("Name, Email, Phone, and Role are required.");
      return;
    }
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    const phoneRegex = /^\\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\\s-()]/g, ''))) {
      alert('Please enter a valid phone number (10-15 digits).');
      return;
    }`
);
fs.writeFileSync('src/app/client/manage/users/page.tsx', usersCode, 'utf8');

// Patch login
let loginCode = fs.readFileSync('src/app/login/page.tsx', 'utf8');
loginCode = loginCode.replace(
    "const handleLogin = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError('');",
    `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');`
);
fs.writeFileSync('src/app/login/page.tsx', loginCode, 'utf8');

// Patch signup
let signupCode = fs.readFileSync('src/app/signup/page.tsx', 'utf8');
signupCode = signupCode.replace(
    "const handleSignup = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError('');",
    `const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');`
);
fs.writeFileSync('src/app/signup/page.tsx', signupCode, 'utf8');

console.log("Patched all validation inputs.");
