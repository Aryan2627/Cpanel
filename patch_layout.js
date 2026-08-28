const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// 1. Remove the Profile tab from the sidebar nav array
code = code.replace(/\{ name: 'Profile', path: '\/client\/profile' \},/g, '');

// 2. Add useRouter import
code = code.replace(/import \{ usePathname \} from 'next\/navigation';/, "import { usePathname, useRouter } from 'next/navigation';");

// 3. Initialize useRouter
code = code.replace(/const pathname = usePathname\(\);/, "const pathname = usePathname();\n  const router = useRouter();");

// 4. Update the profile widget to be clickable
code = code.replace(/cursor: 'default'/g, "cursor: 'pointer'");
code = code.replace(
  /onMouseLeave=\{e => e\.currentTarget\.style\.backgroundColor = '#f8fafc'\}/, 
  "onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}\n              onClick={() => router.push('/client/profile')}"
);

fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
