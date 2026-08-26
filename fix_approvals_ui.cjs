const fs = require('fs');
let code = fs.readFileSync('src/app/client/approvals/page.tsx', 'utf8');

code = code.replace(/<button[\s\S]*?View Event <ChevronRight size=\{16\} \/>\s*<\/button>/, 
`                    {!isPending && (
                      <button 
                        onClick={() => router.push(approval.isPoApproval ? \`/client/po/\${approval.poId}\` : \`/client/events/\${approval.eventId}\`)}
                        style={{ padding: '6px 12px', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {approval.isPoApproval ? 'View Purchase Order' : 'View Event'} <ChevronRight size={16} />
                      </button>
                    )}`);

fs.writeFileSync('src/app/client/approvals/page.tsx', code, 'utf8');
