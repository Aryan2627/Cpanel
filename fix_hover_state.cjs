const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

if (!code.includes('const [hoverMenu, setHoverMenu] = useState')) {
  code = code.replace(
    'const [isSidebarOpen, setIsSidebarOpen] = useState(true);',
    'const [isSidebarOpen, setIsSidebarOpen] = useState(true);\n  const [hoverMenu, setHoverMenu] = useState<string | null>(null);'
  );
  fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
  console.log("Added state");
} else {
  console.log("State already exists");
}
