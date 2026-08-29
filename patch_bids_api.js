const fs = require('fs');
let code = fs.readFileSync('src/app/api/bids/route.ts', 'utf8');

code = code.replace(
  /let bids;\n    if \(eventId\) \{\n      bids = await prisma\.bid\.findMany\(\{\n      where: \{ organizationId: orgId \},\n        where: \{ eventId \},\n        orderBy: \{ amount: 'asc' \}\n      \}\);\n    \} else \{\n      bids = await prisma\.bid\.findMany\(\{\n        orderBy: \{ createdAt: 'desc' \}\n      \}\);\n    \}/,
  `let bids;
    if (eventId) {
      bids = await prisma.bid.findMany({
        where: { organizationId: orgId, eventId },
        orderBy: { amount: 'asc' }
      });
    } else {
      bids = await prisma.bid.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' }
      });
    }`
);

fs.writeFileSync('src/app/api/bids/route.ts', code, 'utf8');
