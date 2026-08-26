const fs = require('fs');
const files = [
  'src/app/client/events/create/auction/page.tsx',
  'src/app/client/events/create/single-stage/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace duration input
    code = code.replace(/type="number" min="0" value=\{durationValue\} onChange=\{e => setDurationValue\(e\.target\.value\)\}/g, 
    'type="number" min="0" value={durationValue} onChange={e => setDurationValue(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()}');
    
    // Replace minBidStep
    code = code.replace(/type="number" min="0" value=\{minBidStep\} onChange=\{e => setMinBidStep\(e\.target\.value\)\}/g, 
    'type="number" min="0" value={minBidStep} onChange={e => setMinBidStep(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()}');
    
    // Replace ceilingPrice
    code = code.replace(/type="number" min="0" value=\{ceilingPrice\} onChange=\{e => setCeilingPrice\(e\.target\.value\)\}/g, 
    'type="number" min="0" value={ceilingPrice} onChange={e => setCeilingPrice(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()}');

    fs.writeFileSync(file, code, 'utf8');
    console.log('Fixed file:', file);
  }
});
