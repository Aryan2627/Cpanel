const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf8');
code = code.replace('import { prisma } from "../../../lib/prisma";', 'import { prisma } from "./prisma";');
fs.writeFileSync('src/lib/auth.ts', code);
console.log("Fixed import in auth.ts");
