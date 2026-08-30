const fs = require('fs');

const pages = {};

// 1. SUMMARY PAGE
pages['src/app/client/license/summary/page.tsx'] = `
'use client';
import React from 'react';
import { PieChart, Activity, AlertTriangle, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

export default function LicenseSummary() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>License Summary</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Executive overview of your software asset landscape.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {[
          { title: 'Total License Value', value: '$2.4M', icon: DollarSign, color: '#3b82f6', trend: '+4.2%' },
          { title: 'Active Licenses', value: '14,204', icon: CheckCircle, color: '#10b981', trend: '+1.1%' },
          { title: 'Compliance Risk', value: 'High (3)', icon: AlertTriangle, color: '#ef4444', trend: 'Needs Action' },
          { title: 'Under-utilized', value: '$184k', icon: TrendingUp, color: '#f59e0b', trend: 'Potential Savings' },
        ].map((kpi, i) => (
          <div key={i} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ backgroundColor: kpi.color + '15', padding: '12px', borderRadius: '8px', color: kpi.color }}>
                <kpi.icon size={24} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: kpi.color }}>{kpi.trend}</span>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{kpi.value}</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{kpi.title}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Spend by Publisher</h3>
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
             {[
               { name: 'Microsoft', pct: 45, color: '#3b82f6' },
               { name: 'Salesforce', pct: 25, color: '#0ea5e9' },
               { name: 'Adobe', pct: 15, color: '#ef4444' },
               { name: 'Oracle', pct: 10, color: '#f59e0b' },
               { name: 'Other', pct: 5, color: '#94a3b8' }
             ].map(pub => (
               <div key={pub.name}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                   <span style={{ fontWeight: 600, color: '#334155' }}>{pub.name}</span>
                   <span style={{ color: '#64748b' }}>{pub.pct}%</span>
                 </div>
                 <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                   <div style={{ width: \`\${pub.pct}%\`, backgroundColor: pub.color, height: '100%' }}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              "50 new Adobe CC licenses allocated.",
              "Oracle DB maintenance expires in 12 days.",
              "Microsoft EA renewal finalized.",
              "Unlicensed installations detected on 3 servers."
            ].map((msg, i) => (
              <div key={i} style={{ padding: '12px', borderLeft: '3px solid #3b82f6', backgroundColor: '#f8fafc', fontSize: '0.9rem', color: '#334155' }}>
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

// 2. PRODUCTS PAGE
pages['src/app/client/license/products/page.tsx'] = `
'use client';
import React from 'react';
import { Box, Search, Filter } from 'lucide-react';

export default function ProductSummary() {
  const products = [
    { name: 'Creative Cloud All Apps', publisher: 'Adobe', type: 'Subscription', total: 450, used: 432, cost: '$85.99/mo' },
    { name: 'Office 365 E5', publisher: 'Microsoft', type: 'Subscription', total: 2000, used: 1980, cost: '$38.00/mo' },
    { name: 'Sales Cloud Enterprise', publisher: 'Salesforce', type: 'Subscription', total: 300, used: 250, cost: '$150.00/mo' },
    { name: 'AutoCAD 2024', publisher: 'Autodesk', type: 'Perpetual', total: 50, used: 55, cost: '$1,865/yr' }, // Overutilized
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Product Summary</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Analyze consumption metrics by specific software product.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '12px' }} />
            <input type="text" placeholder="Search products..." style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '250px' }} />
          </div>
          <button style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Product Name</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Publisher</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Utilization</th>
              <th style={{ padding: '16px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Unit Cost</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const utilPct = Math.round((p.used / p.total) * 100);
              const isOver = utilPct > 100;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, color: '#0f172a' }}>
                    <Box size={20} color="#3b82f6" /> {p.name}
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{p.publisher}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: isOver ? '#ef4444' : '#334155', fontWeight: 600 }}>{p.used} / {p.total} Seats</span>
                      <span style={{ color: isOver ? '#ef4444' : '#64748b' }}>{utilPct}%</span>
                    </div>
                    <div style={{ width: '200px', backgroundColor: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: \`\${Math.min(utilPct, 100)}%\`, backgroundColor: isOver ? '#ef4444' : '#10b981', height: '100%' }}></div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: '#0f172a' }}>{p.cost}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

// 3. PUBLISHERS PAGE
pages['src/app/client/license/publishers/page.tsx'] = `
'use client';
import React from 'react';
import { Building2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function PublisherSummary() {
  const publishers = [
    { name: 'Microsoft Corporation', tier: 'Tier 1', spend: '$1.2M', compliance: 'Compliant', risk: 'Low' },
    { name: 'Oracle', tier: 'Tier 1', spend: '$850K', compliance: 'Audit Risk', risk: 'High' },
    { name: 'Adobe Systems', tier: 'Tier 2', spend: '$320K', compliance: 'Compliant', risk: 'Low' },
    { name: 'Atlassian', tier: 'Tier 2', spend: '$150K', compliance: 'Under-Licensed', risk: 'Medium' },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Publisher Summary</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {publishers.map((pub, i) => (
          <div key={i} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px' }}><Building2 size={24} color="#475569" /></div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>{pub.name}</h3>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#475569' }}>{pub.tier}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Annual Spend</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{pub.spend}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Compliance</div>
                <div style={{ fontWeight: 600, color: pub.risk === 'High' ? '#ef4444' : pub.risk === 'Medium' ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {pub.risk === 'Low' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />} {pub.compliance}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

// 4. ALL LICENSES
pages['src/app/client/license/all/page.tsx'] = `
'use client';
import React from 'react';
import { List, Download } from 'lucide-react';

export default function AllLicenses() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>All Licenses Ledger</h1>
        <button style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Download size={18} /> Export Inventory
        </button>
      </div>
      
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', textAlign: 'center', color: '#64748b' }}>
        <List size={48} color="#cbd5e1" style={{ margin: '0 auto 16px auto' }} />
        <h3>Master Inventory Grid</h3>
        <p>This grid displays the 14,204 active license records in your database.</p>
        <p style={{ fontSize: '0.85rem' }}>* Pagination and infinite scroll enabled.</p>
      </div>
    </div>
  );
}
`;

// 5. ALLOCATIONS
pages['src/app/client/license/allocations/page.tsx'] = `
'use client';
import React from 'react';
import { Users, ArrowRightLeft } from 'lucide-react';

export default function Allocations() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Apply Allocations & Exemptions</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '16px', alignItems: 'center' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '400px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Available Pool</h3>
          <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>Office 365 E5 (20 seats available)</div>
          <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>Adobe Photoshop (5 seats available)</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowRightLeft size={24} />
          </button>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '400px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Target Users / Groups</h3>
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' }}>
             <Users size={20} color="#64748b" /> Engineering Dept
          </div>
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' }}>
             <Users size={20} color="#64748b" /> Marketing Dept
          </div>
        </div>
      </div>
    </div>
  );
}
`;

// 6. RECOMMENDATIONS
pages['src/app/client/license/recommendations/page.tsx'] = `
'use client';
import React from 'react';
import { Sparkles, TrendingDown } from 'lucide-react';

export default function Recommendations() {
  const recs = [
    { title: 'Reclaim Inactive Adobe Licenses', desc: '42 users have not logged into Creative Cloud in over 90 days.', savings: '$35,000/yr' },
    { title: 'Consolidate Zoom to Teams', desc: 'You are paying for Zoom Pro but have Microsoft Teams included in E5.', savings: '$12,400/yr' },
    { title: 'Downgrade Salesforce Tiers', desc: '15 users have "Enterprise" but only use "Professional" features.', savings: '$8,200/yr' },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Sparkles size={32} color="#8b5cf6" />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>AI Cost Recommendations</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {recs.map((rec, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.2rem' }}>{rec.title}</h3>
              <p style={{ margin: 0, color: '#64748b' }}>{rec.desc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingDown size={14} /> Est. Savings</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{rec.savings}</div>
              </div>
              <button style={{ padding: '10px 24px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Execute Action</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

// 7. POINTS RULE SETS
pages['src/app/client/license/points/page.tsx'] = `
'use client';
import React from 'react';
import { Settings2 } from 'lucide-react';

export default function PointsRuleSets() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Points Rule Sets</h1>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px', maxWidth: '600px' }}>
        <Settings2 size={40} color="#3b82f6" style={{ marginBottom: '16px' }} />
        <h2>Metric Configuration Engine</h2>
        <p style={{ color: '#64748b', lineHeight: 1.6 }}>Configure complex licensing metrics such as IBM Processor Value Units (PVU), Oracle Core Factors, or Microsoft CAL multiplexing rules.</p>
        <button style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ Create New Rule Set</button>
      </div>
    </div>
  );
}
`;

// 8. EXPIRY: MAINTENANCE
pages['src/app/client/license/expiry/maintenance/page.tsx'] = `
'use client';
import React from 'react';
import { Wrench } from 'lucide-react';

export default function MaintenanceExpiry() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>License & Maintenance Expiry</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Track support cutoffs for perpetual software.</p>
      
      <div style={{ borderLeft: '4px solid #e2e8f0', marginLeft: '24px', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
         <div style={{ position: 'relative' }}>
           <div style={{ position: 'absolute', left: '-42px', top: '0', backgroundColor: '#ef4444', color: '#fff', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wrench size={16} /></div>
           <h3 style={{ margin: '0 0 4px 0' }}>Oracle Database Enterprise - Support Expiring</h3>
           <p style={{ margin: 0, color: '#ef4444', fontWeight: 600 }}>Expires in 12 Days (Nov 15, 2026)</p>
         </div>
         <div style={{ position: 'relative' }}>
           <div style={{ position: 'absolute', left: '-42px', top: '0', backgroundColor: '#f59e0b', color: '#fff', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wrench size={16} /></div>
           <h3 style={{ margin: '0 0 4px 0' }}>VMware vSphere Standard - Maintenance</h3>
           <p style={{ margin: 0, color: '#f59e0b', fontWeight: 600 }}>Expires in 45 Days (Dec 18, 2026)</p>
         </div>
      </div>
    </div>
  );
}
`;

// 9. EXPIRY: CONTRACTS
pages['src/app/client/license/expiry/contracts/page.tsx'] = `
'use client';
import React from 'react';
import { FileText } from 'lucide-react';

export default function ContractExpiry() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Contract Expiry</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {['Next 30 Days', '30-90 Days', '90+ Days'].map(col => (
          <div key={col} style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#475569' }}>{col}</h3>
            {col === 'Next 30 Days' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><FileText size={16} /> Microsoft Enterprise Agreement</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>MSA-2023-991 • Expires Nov 30</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
`;

// 10. EXPIRY: PAYMENTS
pages['src/app/client/license/expiry/payments/page.tsx'] = `
'use client';
import React from 'react';
import { CreditCard } from 'lucide-react';

export default function PaymentsDue() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Licenses with Payments Due</h1>
      
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569' }}>Invoice ID</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569' }}>Publisher</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569' }}>Due Date</th>
              <th style={{ padding: '16px', textAlign: 'right', color: '#475569' }}>Amount</th>
              <th style={{ padding: '16px', textAlign: 'center', color: '#475569' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '16px', fontWeight: 500 }}><CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }}/>INV-8832</td>
              <td style={{ padding: '16px' }}>Salesforce</td>
              <td style={{ padding: '16px', color: '#ef4444', fontWeight: 600 }}>Nov 15, 2026</td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>$14,500.00</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>
                <button style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Generate PO</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

for (const [path, content] of Object.entries(pages)) {
  fs.writeFileSync(path, content, 'utf8');
}
console.log("All 10 pages generated.");
