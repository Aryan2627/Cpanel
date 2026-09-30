const fs = require('fs');

const hardcodedStr = ' || "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"';
const hardcodedStr2 = 'apiKeyToUse = "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";';

function removeHardcodedKey(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove from Anveshan & Tark
    content = content.replace(hardcodedStr, '');
    
    // Remove from Evaluate Bids (Garuda)
    content = content.replace(hardcodedStr, '');
    
    // Remove from Negotiate (Niti)
    if (content.includes(hardcodedStr2)) {
      content = content.replace(hardcodedStr2, 'apiKeyToUse = null;');
    }
    
    fs.writeFileSync(filePath, content);
  }
}

removeHardcodedKey('src/app/api/agents/anveshan/route.ts');
removeHardcodedKey('src/app/api/agents/risk-report/route.ts');
removeHardcodedKey('src/app/api/ai/evaluate-bids/route.ts');
removeHardcodedKey('src/app/api/ai/negotiate/route.ts');

console.log('Removed all hardcoded API keys');
