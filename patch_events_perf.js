const fs = require('fs');
let code = fs.readFileSync('src/app/api/events/route.ts', 'utf8');

// Find the sequential awaits for jarvis and approval and just fire and forget them, or Promise.all them
code = code.replace(
  /await prisma\.jarvisMemory\.create\(\{/g,
  `prisma.jarvisMemory.create({`
);

code = code.replace(
  /await prisma\.approvalRequest\.create\(\{/g,
  `prisma.approvalRequest.create({`
);

fs.writeFileSync('src/app/api/events/route.ts', code, 'utf8');
console.log("Optimized event API");
