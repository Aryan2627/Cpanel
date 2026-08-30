const fs = require('fs');

const pages = {};

const baseLayout = (title, subtitle, content) => \`
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>\${title}</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>\${subtitle}</p>
        \${content}
      </div>
    </div>
  );
}
\`;

// 1. SUMMARY PAGE
pages['src/app/client/license/summary/page.tsx'] = baseLayout(
  'License Summary',
  'A clear, high-level overview of your software assets.',
  `
  <div style={{ display: 'flex', gap: '32px', marginBottom: '48px', flexWrap: 'wrap' }}>
    <div style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Value</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 300 }}>$2.4M</div>
    </div>
    <div style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Licenses</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 300 }}>14,204</div>
    </div>
    <div style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Under-utilized</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 300 }}>$184k</div>
    </div>
  </div>

  <h2 style={{ fontSize: '1.2rem', fontWeight: 500, borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '24px' }}>Recent Activity</h2>
  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1rem', color: '#374151', lineHeight: '2' }}>
    <li>• 50 new Adobe CC licenses allocated to Marketing.</li>
    <li>• Oracle DB maintenance expires in 12 days.</li>
    <li>• Microsoft Enterprise Agreement renewal finalized.</li>
  </ul>
  `
);

// 2. PRODUCTS PAGE
pages['src/app/client/license/products/page.tsx'] = baseLayout(
  'Product Summary',
  'Review software utilization by product.',
  `
  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
    <thead>
      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Product Name</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Publisher</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Seats Used</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Total Seats</th>
      </tr>
    </thead>
    <tbody>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <td style={{ padding: '16px 8px' }}>Creative Cloud All Apps</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>Adobe</td>
        <td style={{ padding: '16px 8px' }}>432</td>
        <td style={{ padding: '16px 8px' }}>450</td>
      </tr>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <td style={{ padding: '16px 8px' }}>Office 365 E5</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>Microsoft</td>
        <td style={{ padding: '16px 8px' }}>1980</td>
        <td style={{ padding: '16px 8px' }}>2000</td>
      </tr>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <td style={{ padding: '16px 8px' }}>Sales Cloud Enterprise</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>Salesforce</td>
        <td style={{ padding: '16px 8px' }}>250</td>
        <td style={{ padding: '16px 8px' }}>300</td>
      </tr>
    </tbody>
  </table>
  `
);

// 3. PUBLISHERS PAGE
pages['src/app/client/license/publishers/page.tsx'] = baseLayout(
  'Publisher Summary',
  'Manage your top software vendors.',
  `
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>Microsoft Corporation</div>
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tier 1 Vendor</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1.2rem' }}>$1.2M Spend</div>
        <div style={{ color: '#059669', fontSize: '0.9rem' }}>Compliant</div>
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>Oracle</div>
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tier 1 Vendor</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1.2rem' }}>$850K Spend</div>
        <div style={{ color: '#dc2626', fontSize: '0.9rem' }}>Audit Risk</div>
      </div>
    </div>
  </div>
  `
);

// 4. ALL LICENSES
pages['src/app/client/license/all/page.tsx'] = baseLayout(
  'All Licenses',
  'Search and manage your entire software inventory.',
  `
  <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
    <input type="text" placeholder="Search licenses..." style={{ flex: 1, padding: '12px 16px', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
    <button style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>Search</button>
  </div>
  <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
    Search above to load the license grid.
  </div>
  `
);

// 5. ALLOCATIONS
pages['src/app/client/license/allocations/page.tsx'] = baseLayout(
  'Apply Allocations',
  'Assign available licenses to users or departments.',
  `
  <div style={{ display: 'flex', gap: '40px' }}>
    <div style={{ flex: 1 }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '16px' }}>1. Select License</h2>
      <select style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '16px' }}>
        <option>Office 365 E5 (20 available)</option>
        <option>Adobe Photoshop (5 available)</option>
      </select>
    </div>
    
    <div style={{ flex: 1 }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '16px' }}>2. Select Target</h2>
      <select style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '24px' }}>
        <option>Engineering Department</option>
        <option>Marketing Department</option>
      </select>
    </div>
  </div>
  <button style={{ padding: '12px 32px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>Assign License</button>
  `
);

// 6. RECOMMENDATIONS
pages['src/app/client/license/recommendations/page.tsx'] = baseLayout(
  'Recommended Changes',
  'Simple, actionable cost-saving recommendations.',
  `
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '4px' }}>Reclaim Inactive Adobe Licenses</div>
        <div style={{ color: '#6b7280' }}>42 users have not logged into Creative Cloud in 90 days.</div>
      </div>
      <button style={{ padding: '10px 20px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Reclaim (Save $35k)</button>
    </div>

    <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '4px' }}>Consolidate Zoom to Teams</div>
        <div style={{ color: '#6b7280' }}>You pay for Zoom Pro but have Teams included in E5.</div>
      </div>
      <button style={{ padding: '10px 20px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel Zoom (Save $12k)</button>
    </div>
  </div>
  `
);

// 7. POINTS RULE SETS
pages['src/app/client/license/points/page.tsx'] = baseLayout(
  'Points Rule Sets',
  'Manage custom licensing metrics and calculations.',
  `
  <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151', marginBottom: '32px', maxWidth: '600px' }}>
    Use this section to configure complex calculation metrics like IBM PVU or Oracle Core Factors. Select a publisher to load their default rule templates.
  </p>
  <button style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>Create Rule Set</button>
  `
);

// 8. EXPIRY: MAINTENANCE
pages['src/app/client/license/expiry/maintenance/page.tsx'] = baseLayout(
  'Maintenance Expiry',
  'Upcoming support and maintenance cutoffs.',
  `
  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
    <li style={{ padding: '24px 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Oracle Database Enterprise</div>
        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>Support contract expires soon.</div>
      </div>
      <div style={{ color: '#dc2626', fontWeight: 500, textAlign: 'right' }}>
        Nov 15, 2026<br/><span style={{ fontSize: '0.85rem' }}>12 Days</span>
      </div>
    </li>
    <li style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>VMware vSphere Standard</div>
        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>Maintenance expires soon.</div>
      </div>
      <div style={{ color: '#d97706', fontWeight: 500, textAlign: 'right' }}>
        Dec 18, 2026<br/><span style={{ fontSize: '0.85rem' }}>45 Days</span>
      </div>
    </li>
  </ul>
  `
);

// 9. EXPIRY: CONTRACTS
pages['src/app/client/license/expiry/contracts/page.tsx'] = baseLayout(
  'Contract Expiry',
  'Master Service Agreements (MSAs) expiring soon.',
  `
  <div style={{ padding: '24px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
    <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '1.1rem' }}>Microsoft Enterprise Agreement</h3>
    <div style={{ color: '#7f1d1d', marginBottom: '16px' }}>MSA-2023-991 • Expires Nov 30 (Next 30 Days)</div>
    <button style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Review Contract</button>
  </div>
  `
);

// 10. EXPIRY: PAYMENTS
pages['src/app/client/license/expiry/payments/page.tsx'] = baseLayout(
  'Payments Due',
  'Upcoming invoices for software renewals.',
  `
  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
    <thead>
      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Invoice</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Publisher</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Due Date</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280', textAlign: 'right' }}>Amount</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280', textAlign: 'right' }}>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style={{ padding: '16px 8px' }}>INV-8832</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>Salesforce</td>
        <td style={{ padding: '16px 8px', color: '#dc2626' }}>Nov 15, 2026</td>
        <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 500 }}>$14,500.00</td>
        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
          <button style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Generate PO</button>
        </td>
      </tr>
    </tbody>
  </table>
  `
);

for (const [path, content] of Object.entries(pages)) {
  fs.writeFileSync(path, content, 'utf8');
}
console.log("All 10 pages simplified and regenerated.");
