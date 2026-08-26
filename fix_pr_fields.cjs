const fs = require('fs');

let file = 'src/app/client/events/create/single-stage/page.tsx';
if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    const injection = `
  useEffect(() => {
    if (fromPR) {
       let allFields = [];
       try {
           if (selectedTechnicalTemplateObj) allFields = [...allFields, ...JSON.parse(selectedTechnicalTemplateObj.fields)];
           if (selectedRfqTemplateObj) allFields = [...allFields, ...JSON.parse(selectedRfqTemplateObj.fields)];
           if (selectedAuctionTemplateObj) allFields = [...allFields, ...JSON.parse(selectedAuctionTemplateObj.fields)];
           
           const creatorFields = allFields.filter(f => f.role === 'Creator');
           if (creatorFields.length > 0) {
               setCreatorData(prev => {
                   const newData = { ...prev };
                   let changed = false;
                   creatorFields.forEach(f => {
                       if (f.type === 'product' && prev['Product Name'] && !newData[f.key]) { newData[f.key] = prev['Product Name']; changed = true; }
                       else {
                           const ln = (f.name || '').toLowerCase();
                           if ((ln.includes('quantity') || ln === 'qty') && prev['Quantity'] && !newData[f.key]) { newData[f.key] = prev['Quantity']; changed = true; }
                           if ((ln.includes('uom') || ln.includes('unit')) && prev['UOM'] && !newData[f.key]) { newData[f.key] = prev['UOM']; changed = true; }
                           if (ln.includes('code') && prev['Product Code'] && !newData[f.key]) { newData[f.key] = prev['Product Code']; changed = true; }
                           if (ln.includes('category') && prev['Category'] && !newData[f.key]) { newData[f.key] = prev['Category']; changed = true; }
                       }
                   });
                   return changed ? newData : prev;
               });
           }
       } catch(e) {}
    }
  }, [selectedTechnicalTemplateObj, selectedRfqTemplateObj, selectedAuctionTemplateObj, fromPR]);
`;

    code = code.replace("const [creatorData, setCreatorData] = useState<Record<string, string>>({});", 
    "const [creatorData, setCreatorData] = useState<Record<string, string>>({});" + injection);

    fs.writeFileSync(file, code, 'utf8');
}

file = 'src/app/client/events/create/auction/page.tsx';
if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    const injection = `
  useEffect(() => {
    if (fromPR) {
       let allFields = [];
       try {
           if (selectedTemplateObj) allFields = [...allFields, ...JSON.parse(selectedTemplateObj.fields)];
           if (selectedStage2TemplateObj) allFields = [...allFields, ...JSON.parse(selectedStage2TemplateObj.fields)];
           
           const creatorFields = allFields.filter(f => f.role === 'Creator');
           if (creatorFields.length > 0) {
               setCreatorData(prev => {
                   const newData = { ...prev };
                   let changed = false;
                   creatorFields.forEach(f => {
                       if (f.type === 'product' && prev['Product Name'] && !newData[f.key]) { newData[f.key] = prev['Product Name']; changed = true; }
                       else {
                           const ln = (f.name || '').toLowerCase();
                           if ((ln.includes('quantity') || ln === 'qty') && prev['Quantity'] && !newData[f.key]) { newData[f.key] = prev['Quantity']; changed = true; }
                           if ((ln.includes('uom') || ln.includes('unit')) && prev['UOM'] && !newData[f.key]) { newData[f.key] = prev['UOM']; changed = true; }
                           if (ln.includes('code') && prev['Product Code'] && !newData[f.key]) { newData[f.key] = prev['Product Code']; changed = true; }
                           if (ln.includes('category') && prev['Category'] && !newData[f.key]) { newData[f.key] = prev['Category']; changed = true; }
                       }
                   });
                   return changed ? newData : prev;
               });
           }
       } catch(e) {}
    }
  }, [selectedTemplateObj, selectedStage2TemplateObj, fromPR]);
`;

    code = code.replace("const [creatorData, setCreatorData] = useState<Record<string, string>>({});", 
    "const [creatorData, setCreatorData] = useState<Record<string, string>>({});" + injection);

    fs.writeFileSync(file, code, 'utf8');
}
