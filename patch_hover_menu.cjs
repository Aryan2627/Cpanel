const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// 1. Add hoverMenu state
const statePoint = `const [openMenu, setOpenMenu] = useState<string | null>(
    pathname.includes('/client/manage') ? 'Manage' : pathname.includes('/client/settings') ? 'Settings' : null
  );`;
const hoverState = `\n  const [hoverMenu, setHoverMenu] = useState<string | null>(null);`;

if (!code.includes('const [hoverMenu')) {
    code = code.replace(statePoint, statePoint + hoverState);
}

// 2. Add onMouseEnter / onMouseLeave to the <li>
const oldLi = `<li key={item.name}>`;
const newLi = `<li key={item.name} onMouseEnter={() => setHoverMenu(item.name)} onMouseLeave={() => setHoverMenu(null)}>`;

if (!code.includes('setHoverMenu(item.name)')) {
    code = code.replace(/<li key=\{item\.name\}>/g, newLi);
}

// 3. Update the condition to show the menu
const oldActiveCheck = `className={openMenu === item.name ? 'active' : ''}`;
const newActiveCheck = `className={(openMenu === item.name || hoverMenu === item.name) ? 'active' : ''}`;
code = code.replace(oldActiveCheck, newActiveCheck);

const oldRotate = `transform: openMenu === item.name ? 'rotate(180deg)' : 'rotate(0deg)'`;
const newRotate = `transform: (openMenu === item.name || hoverMenu === item.name) ? 'rotate(180deg)' : 'rotate(0deg)'`;
code = code.replace(oldRotate, newRotate);

const oldShowMenu = `{openMenu === item.name && (`;
const newShowMenu = `{(openMenu === item.name || hoverMenu === item.name) && (`;
code = code.replace(oldShowMenu, newShowMenu);

fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Patched layout with hoverMenu functionality");
