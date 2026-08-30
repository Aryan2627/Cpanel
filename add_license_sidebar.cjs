const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// 1. Add licenseSubItems array definition
const licenseSubItemsDef = `
  const licenseSubItems = [
    { name: 'License Summary', path: '/client/license/summary' },
    { name: 'Product Summary', path: '/client/license/products' },
    { name: 'Publisher Summary', path: '/client/license/publishers' },
    { name: 'All Licenses', path: '/client/license/all' },
    { name: 'Apply Allocations and Exemptions', path: '/client/license/allocations' },
    { name: 'Recommended License Changes', path: '/client/license/recommendations' },
    { name: 'Points Rule Sets', path: '/client/license/points' },
    { name: 'LICENSE EXPIRY', path: '#', isHeader: true },
    { name: 'License and Maintenance Expiry', path: '/client/license/expiry/maintenance' },
    { name: 'License Contract Expiry', path: '/client/license/expiry/contracts' },
    { name: 'Licenses with Payments Due', path: '/client/license/expiry/payments' }
  ];
`;

if (!code.includes('const licenseSubItems')) {
  code = code.replace('const navItems = [', licenseSubItemsDef + '\n  const navItems = [');
}

// 2. Add License Management to navItems
const licenseNavItem = `
      { 
        name: 'License Management', 
        path: '#',
        subItems: licenseSubItems
      },`;

if (!code.includes("name: 'License Management'")) {
  code = code.replace("name: 'Settings'", licenseNavItem + "\n      { \n        name: 'Settings'");
}

// 3. Update the rendering logic to support isHeader
const oldRender = `{item.subItems.map(subItem => (
                            <li key={subItem.name}>
                              <Link 
                                href={subItem.path}
                                className={pathname === subItem.path ? 'active' : ''}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}`;

const newRender = `{item.subItems.map((subItem: any) => (
                            subItem.isHeader ? (
                              <li key={subItem.name} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', marginTop: '16px', marginBottom: '8px', paddingLeft: '20px', textTransform: 'uppercase' }}>
                                {subItem.name}
                              </li>
                            ) : (
                              <li key={subItem.name}>
                                <Link 
                                  href={subItem.path}
                                  className={pathname === subItem.path ? 'active' : ''}
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            )
                          ))}`;

if (code.includes('key={subItem.name}>') && !code.includes('subItem.isHeader ?')) {
  code = code.replace(oldRender, newRender);
}

fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Patched layout with License Sub Items");
