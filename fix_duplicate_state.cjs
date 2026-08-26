const fs = require('fs');

const files = [
  'src/app/client/events/create/auction/page.tsx',
  'src/app/client/events/create/single-stage/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace duplicate state definitions
    code = code.replace(/const \[isVendorModalOpen, setIsVendorModalOpen\] = useState\(false\);\s*const \[isVendorModalOpen, setIsVendorModalOpen\] = useState\(false\);/, 
    'const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);');
    
    // More robust replace if they are separated
    // e.g. 
    // const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    // const [tempSelectedVendorIds, setTempSelectedVendorIds] = useState<Set<string>>(new Set());
    // const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const regex = /const \[isVendorModalOpen, setIsVendorModalOpen\] = useState\(false\);\s*const \[tempSelectedVendorIds, setTempSelectedVendorIds\] = useState<Set<string>>\(new Set\(\)\);\s*const \[isVendorModalOpen, setIsVendorModalOpen\] = useState\(false\);/;
    
    if (regex.test(code)) {
      code = code.replace(regex, 'const [tempSelectedVendorIds, setTempSelectedVendorIds] = useState<Set<string>>(new Set());\n  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);');
      fs.writeFileSync(file, code, 'utf8');
      console.log('Fixed duplicate state in', file);
    } else {
        // Find all instances
        const matches = code.match(/const \[isVendorModalOpen, setIsVendorModalOpen\] = useState\(false\);/g);
        if (matches && matches.length > 1) {
             let first = true;
             code = code.replace(/const \[isVendorModalOpen, setIsVendorModalOpen\] = useState\(false\);/g, (match) => {
                 if (first) {
                     first = false;
                     return match;
                 }
                 return '';
             });
             fs.writeFileSync(file, code, 'utf8');
             console.log('Fixed multiple declarations in', file);
        }
    }
  }
});
