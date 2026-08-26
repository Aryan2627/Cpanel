const fs = require('fs');

const file = 'src/app/vendor/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const searchStr = `<div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#020617', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Field Name</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', width: '350px' }}>Your Response</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Type / Requirement</th>
                </tr>
              </thead>
              <tbody>
                {templateFields.map((f: any) => (
                  <tr key={f.key} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {f.name}`;

const replacement = `<div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>
            {(() => {
              const groupedFields = new Map<any, any[]>();
              templateFields.forEach((f: any) => {
                  const g = f._sourceItemId || 'default';
                  if (!groupedFields.has(g)) groupedFields.set(g, []);
                  groupedFields.get(g)!.push(f);
              });
              
              if (groupedFields.size === 0) {
                return (
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    No template fields found for this event.
                  </div>
                );
              }

              return Array.from(groupedFields.entries()).map(([groupId, groupFields]: any, gIdx: number) => {
                let groupName = \`Line Item \${gIdx + 1}\`;
                if (groupedFields.size > 1 && groupFields.length > 0) {
                  const firstField = groupFields[0];
                  if (firstField.name && firstField.name.includes(' - ')) {
                    groupName = firstField.name.split(' - ')[0];
                  }
                }
                if (groupId === 'default' && groupedFields.size === 1) groupName = 'Bidding Requirements';
                
                const isMulti = groupedFields.size > 1;

                return (
                  <div key={groupId} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                    {isMulti && (
                      <div style={{ backgroundColor: '#1e293b', padding: '16px 24px', borderBottom: '1px solid #334155', color: '#f8fafc', fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '4px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
                        {groupName}
                      </div>
                    )}
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#020617', borderBottom: '1px solid #1e293b' }}>
                          <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Field Name</th>
                          <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', width: '350px' }}>Your Response</th>
                          <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Type / Requirement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupFields.map((f: any) => (
                          <tr key={f.key} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '20px 24px' }}>
                              <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isMulti ? (f.originalName || f.name.replace(groupName + ' - ', '')) : f.name}`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replacement);
    
    // Also remove the old empty state logic
    const emptyStateLogic = `{templateFields.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      No template fields found for this event.
                    </td>
                  </tr>
                )}`;
    if (code.includes(emptyStateLogic)) {
       code = code.replace(emptyStateLogic, '');
    }

    // Replace closing div
    const endStr = `              </tbody>
            </table>
            
            {/* Total Footer */}`;
    const endReplacement = `              </tbody>
                    </table>
                  </div>
                );
              });
            })()}
          </div>
            
            {/* Total Footer */}`;
            
    code = code.replace(endStr, endReplacement);
    
    fs.writeFileSync(file, code, 'utf8');
    console.log('Successfully updated vendor UI grouping');
} else {
    console.log('Search string not found!');
}
