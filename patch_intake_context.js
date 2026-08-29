const fs = require('fs');
let code = fs.readFileSync('src/context/IntakeContext.tsx', 'utf8');

if (!code.includes('usePathname')) {
  code = code.replace(
    `import { createContext, useContext, useState, useEffect, ReactNode } from 'react';`,
    `import { createContext, useContext, useState, useEffect, ReactNode } from 'react';\nimport { usePathname } from 'next/navigation';`
  );

  code = code.replace(
    `export function IntakeProvider({ children }: { children: ReactNode }) {
  const [intakes, setIntakes] = useState<Intake[]>([]);

  useEffect(() => {`,
    `export function IntakeProvider({ children }: { children: ReactNode }) {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const pathname = usePathname();

  useEffect(() => {`
  );

  code = code.replace(
    `  }, []);`,
    `  }, [pathname]);` // refetch on navigation
  );

  fs.writeFileSync('src/context/IntakeContext.tsx', code, 'utf8');
  console.log("Patched IntakeContext to refetch on navigation");
} else {
  console.log("Already patched");
}
