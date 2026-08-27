const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// Use regex or string replacement to swap out the navigation configuration.
// We'll replace everything from `const manageSubItems = [` up to the end of `const navItems = [ ... ];`

const newNavCode = `const manageSubItems = [
    { name: 'Users', path: '/client/manage/users' },
    { name: 'Products', path: '/client/manage/products' },
    { name: 'Templates', path: '/client/manage/templates' }
  ];

  if (showWorkflows) {
    manageSubItems.push(
      { name: 'Dropdowns & Fields', path: '/client/manage/workflows' },
      { name: 'Approval Rules', path: '/client/manage/approvals' }
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/client' },
    { name: 'Approvals', path: '/client/approvals' },
    { name: 'Purchase Requests', path: '/client/intake' },
    { name: 'Requisitions', path: '/client/pr' },
    { name: 'Tenders & Auctions', path: '/client/events' },
    { 
      name: 'Vendors', 
      path: '#',
      subItems: [
        { name: 'Supplier List', path: '/client/vendors' },
        { name: 'Chat / Messages', path: '/client/vendors/messages' }
      ]
    },
    { name: 'Purchase Orders', path: '/client/po' },
    { 
      name: 'Master Data', 
      path: '#',
      subItems: manageSubItems
    },
    { 
      name: 'Settings', 
      path: '#',
      subItems: [
        { name: 'General', path: '/client/settings' }
      ]
    },
    { name: 'Profile', path: '/client/profile' },
  ];`;

// Find start and end indices of the blocks to replace
const startMatch = "const manageSubItems = [";
const endMatch = "  ];";
const navItemsMatch = "const navItems = [";

const startIndex = code.indexOf(startMatch);
// find the end of navItems
const navStartIndex = code.indexOf(navItemsMatch);
const endOfNavItems = code.indexOf("  ];", navStartIndex) + 4;

if (startIndex !== -1 && endOfNavItems !== -1) {
    code = code.substring(0, startIndex) + newNavCode + code.substring(endOfNavItems);
    fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
    console.log("Navigation updated successfully!");
} else {
    console.log("Failed to find navigation block to replace.");
}
