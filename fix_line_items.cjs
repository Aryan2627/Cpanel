const fs = require('fs');

const fixPage = (file, isAuction) => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');

    // 1. Add getMultipliedFields
    const multipliedFn = `
  const getMultipliedFields = (baseFields: any[], items: any[], isPR: boolean) => {
    if (!items || items.length === 0) return baseFields;
    if (!isPR && items.length === 1 && !items[0].values['Item Name']) return baseFields;
    
    const flatFields: any[] = [];
    items.forEach((item: any, idx: number) => {
      const itemName = item.values['Item Name'] || \`Item \${idx+1}\`;
      baseFields.forEach((f: any) => {
        const newField = { ...f, key: \`\${item.id}_\${f.key}\`, originalKey: f.key, _sourceItemId: item.id };
        if (items.length > 1 || isPR) {
          newField.name = \`\${itemName} - \${f.name}\`;
        }
        flatFields.push(newField);
      });
    });
    return flatFields;
  };
`;
    // Insert it before creatorData
    code = code.replace(/const \[creatorData, setCreatorData\] = useState/, multipliedFn + '\n  const [creatorData, setCreatorData] = useState');

    // 2. Replace the old useEffect with one that maps using getMultipliedFields
    const oldEffectSingle = /useEffect\(\(\) => \{\s*if \(fromPR\) \{\s*let allFields = \[\];[\s\S]*?\}\s*\}, \[selectedTechnicalTemplateObj, selectedRfqTemplateObj, selectedAuctionTemplateObj, fromPR\]\);/;
    const newEffectSingle = `useEffect(() => {
    if (fromPR && lineItems.length > 0) {
       let allFields: any[] = [];
       try {
           if (selectedTechnicalTemplateObj) allFields = [...allFields, ...JSON.parse(selectedTechnicalTemplateObj.fields)];
           if (selectedRfqTemplateObj) allFields = [...allFields, ...JSON.parse(selectedRfqTemplateObj.fields)];
           if (selectedAuctionTemplateObj) allFields = [...allFields, ...JSON.parse(selectedAuctionTemplateObj.fields)];
           
           const mFields = getMultipliedFields(allFields, lineItems, fromPR);
           const creatorFields = mFields.filter((f: any) => f.role === 'Creator');
           if (creatorFields.length > 0) {
               setCreatorData(prev => {
                   const newData = { ...prev };
                   let changed = false;
                   creatorFields.forEach((f: any) => {
                       const item = lineItems.find(i => i.id === f._sourceItemId);
                       if (!item) return;
                       
                       if (f.type === 'product' && !newData[f.key]) { newData[f.key] = item.values['Item Name']; changed = true; }
                       else {
                           const ln = (f.originalKey || f.name || '').toLowerCase();
                           if ((ln.includes('quantity') || ln === 'qty') && !newData[f.key]) { newData[f.key] = item.values['Quantity']; changed = true; }
                           if ((ln.includes('uom') || ln.includes('unit')) && !newData[f.key]) { newData[f.key] = item.values['UOM']; changed = true; }
                           if (ln.includes('code') && !newData[f.key]) { newData[f.key] = item.values['Product Code']; changed = true; }
                           if (ln.includes('category') && !newData[f.key]) { newData[f.key] = item.values['Category']; changed = true; }
                       }
                   });
                   return changed ? newData : prev;
               });
           }
       } catch(e) {}
    }
  }, [selectedTechnicalTemplateObj, selectedRfqTemplateObj, selectedAuctionTemplateObj, fromPR, lineItems]);`;

    const oldEffectAuction = /useEffect\(\(\) => \{\s*if \(fromPR\) \{\s*let allFields = \[\];[\s\S]*?\}\s*\}, \[selectedTemplateObj, selectedStage2TemplateObj, fromPR\]\);/;
    const newEffectAuction = `useEffect(() => {
    if (fromPR && lineItems.length > 0) {
       let allFields: any[] = [];
       try {
           if (selectedTemplateObj) allFields = [...allFields, ...JSON.parse(selectedTemplateObj.fields)];
           if (selectedStage2TemplateObj) allFields = [...allFields, ...JSON.parse(selectedStage2TemplateObj.fields)];
           
           const mFields = getMultipliedFields(allFields, lineItems, fromPR);
           const creatorFields = mFields.filter((f: any) => f.role === 'Creator');
           if (creatorFields.length > 0) {
               setCreatorData(prev => {
                   const newData = { ...prev };
                   let changed = false;
                   creatorFields.forEach((f: any) => {
                       const item = lineItems.find(i => i.id === f._sourceItemId);
                       if (!item) return;
                       
                       if (f.type === 'product' && !newData[f.key]) { newData[f.key] = item.values['Item Name']; changed = true; }
                       else {
                           const ln = (f.originalKey || f.name || '').toLowerCase();
                           if ((ln.includes('quantity') || ln === 'qty') && !newData[f.key]) { newData[f.key] = item.values['Quantity']; changed = true; }
                           if ((ln.includes('uom') || ln.includes('unit')) && !newData[f.key]) { newData[f.key] = item.values['UOM']; changed = true; }
                           if (ln.includes('code') && !newData[f.key]) { newData[f.key] = item.values['Product Code']; changed = true; }
                           if (ln.includes('category') && !newData[f.key]) { newData[f.key] = item.values['Category']; changed = true; }
                       }
                   });
                   return changed ? newData : prev;
               });
           }
       } catch(e) {}
    }
  }, [selectedTemplateObj, selectedStage2TemplateObj, fromPR, lineItems]);`;

    if (isAuction) {
        code = code.replace(oldEffectAuction, newEffectAuction);
    } else {
        code = code.replace(oldEffectSingle, newEffectSingle);
    }

    // 3. Update Rendering Logic
    // In Single Stage:
    // const creatorFields = fields.filter((f: any) => f.role === 'Creator');
    // We need to multiply fields FIRST!
    if (isAuction) {
        // Auction rendering block
        code = code.replace(
            /const fields = JSON\.parse\(selectedTemplateObj\.fields\) \|\| \[\];\s*const creatorFields = fields\.filter\(\(f: any\) => f\.role === 'Creator'\);/,
            `const baseFields = JSON.parse(selectedTemplateObj.fields) || [];
                    const fields = getMultipliedFields(baseFields, lineItems, fromPR);
                    const creatorFields = fields.filter((f: any) => f.role === 'Creator');`
        );
        code = code.replace(
            /const fields2 = JSON\.parse\(selectedStage2TemplateObj\.fields\) \|\| \[\];\s*const creatorFields2 = fields2\.filter\(\(f: any\) => f\.role === 'Creator'\);/,
            `const baseFields2 = JSON.parse(selectedStage2TemplateObj.fields) || [];
                    const fields2 = getMultipliedFields(baseFields2, lineItems, fromPR);
                    const creatorFields2 = fields2.filter((f: any) => f.role === 'Creator');`
        );
    } else {
        // Single Stage rendering block
        code = code.replace(
            /const creatorFields = fields\.filter\(\(f: any\) => f\.role === 'Creator'\);/,
            `const mFields = getMultipliedFields(fields, lineItems, fromPR);
                    const creatorFields = mFields.filter((f: any) => f.role === 'Creator');`
        );
    }
    
    // 4. Update the POST payloads
    // Search for JSON.parse(...fields).map
    if (isAuction) {
        code = code.replace(
            /JSON\.parse\(selectedStage2TemplateObj\.fields\)\.map/g,
            `getMultipliedFields(JSON.parse(selectedStage2TemplateObj.fields), lineItems, fromPR).map`
        );
        code = code.replace(
            /JSON\.parse\(selectedTemplateObj\.fields\)\.map/g,
            `getMultipliedFields(JSON.parse(selectedTemplateObj.fields), lineItems, fromPR).map`
        );
    } else {
        code = code.replace(
            /JSON\.parse\(selectedTechnicalTemplateObj\.fields\)\.map/g,
            `getMultipliedFields(JSON.parse(selectedTechnicalTemplateObj.fields), lineItems, fromPR).map`
        );
        code = code.replace(
            /JSON\.parse\(selectedRfqTemplateObj\.fields\)\.map/g,
            `getMultipliedFields(JSON.parse(selectedRfqTemplateObj.fields), lineItems, fromPR).map`
        );
        code = code.replace(
            /JSON\.parse\(selectedAuctionTemplateObj\.fields\)\.map/g,
            `getMultipliedFields(JSON.parse(selectedAuctionTemplateObj.fields), lineItems, fromPR).map`
        );
    }

    // 5. Update itemsCount payload
    code = code.replace(/itemsCount: 1,/g, "itemsCount: lineItems.length || 1,");

    fs.writeFileSync(file, code, 'utf8');
}

fixPage('src/app/client/events/create/auction/page.tsx', true);
fixPage('src/app/client/events/create/single-stage/page.tsx', false);
console.log('Fixed Event Creation line items issue.');
