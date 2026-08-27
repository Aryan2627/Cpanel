const fs = require('fs');
let code = fs.readFileSync('src/app/client/JarvisAssistant.tsx', 'utf8');

// Fix SSR window issue
code = code.replace(
  'const [position, setPosition] = useState({ x: window.innerWidth - 90, y: 20 });',
  'const [position, setPosition] = useState({ x: typeof window !== "undefined" ? window.innerWidth - 90 : 1000, y: 20 });'
);

fs.writeFileSync('src/app/client/JarvisAssistant.tsx', code, 'utf8');
console.log("Fixed SSR window issue");
