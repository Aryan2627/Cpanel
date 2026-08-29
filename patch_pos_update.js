const fs = require('fs');
let code = fs.readFileSync('src/app/api/pos/route.ts', 'utf8');

const replacement = `    // Update Intakes based on awarded quantities
    if (data.details) {
      try {
        const detailsObj = JSON.parse(data.details);
        if (detailsObj.awardedPrs) {
          const prs = detailsObj.awardedPrs;
          for (const [refId, awardedQtyStr] of Object.entries(prs)) {
            const awardedQty = Number(awardedQtyStr);
            const intake = await prisma.intake.findUnique({ where: { refId } });
            
            if (intake && awardedQty > 0) {
              if (awardedQty >= intake.quantity) {
                // Fully awarded -> mark as Approved (Completed)
                await prisma.intake.update({
                  where: { id: intake.id },
                  data: { status: 'Approved' }
                });
              } else {
                // Partially awarded -> split the PR
                const remaining = intake.quantity - awardedQty;
                
                // 1. Mark original PR as Approved with the awarded quantity
                await prisma.intake.update({
                  where: { id: intake.id },
                  data: { 
                    status: 'Approved',
                    quantity: awardedQty
                  }
                });
                
                // 2. Create a new PR for the remaining open quantity
                // We generate a new refId by appending a split identifier, or just use a new random one, 
                // but let's append "-A" or a timestamp to keep it linked.
                await prisma.intake.create({
                  data: {
                    organizationId: intake.organizationId,
                    refId: intake.refId + '-REM' + Math.floor(Math.random() * 1000), // Remaining
                    title: intake.title,
                    reqName: intake.reqName,
                    status: 'Open', // Keep it open
                    type: intake.type,
                    buyer: intake.buyer,
                    reqAt: intake.reqAt,
                    updAt: intake.updAt,
                    source: intake.source,
                    erpId: intake.erpId,
                    quantity: remaining
                  }
                });
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to update PR quantities:", e);
      }
    }

    if (requiresApproval) {`

code = code.replace("    if (requiresApproval) {", replacement);

fs.writeFileSync('src/app/api/pos/route.ts', code, 'utf8');
console.log("Updated api/pos/route.ts");
