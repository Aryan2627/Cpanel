const fs = require('fs');

const modifyFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Sticky Header background
  content = content.replace(
    /background: 'rgba\(255, 255, 255, 0\.75\)', backdropFilter: 'blur\(20px\)', borderBottom: '1px solid rgba\(255,255,255,0\.6\)'/g,
    "background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 55%, #1a2f6b 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)'"
  );

  // Replace Event Title Input color
  content = content.replace(
    /style=\{\{ border: 'none', outline: 'none', fontSize: '1\.25rem', fontWeight: '600', color: '#0f172a', flex: 1, background: 'transparent' \}\}/g,
    "style={{ border: 'none', outline: 'none', fontSize: '1.5rem', fontWeight: '800', color: '#fff', flex: 1, background: 'transparent', letterSpacing: '-0.5px' }}"
  );

  // Replace Workspace container background
  content = content.replace(
    /background: 'rgba\(255,255,255,0\.8\)', padding: '6px', borderRadius: '30px', gap: '4px', border: '1px solid rgba\(226,232,240,0\.8\)'/g,
    "background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '30px', gap: '4px', border: '1px solid rgba(255,255,255,0.2)'"
  );

  // Replace Workspace button colors
  content = content.replace(
    /background: isWorkspaceMode \? '#e0f2fe' : 'transparent', color: isWorkspaceMode \? '#0369a1' : '#64748b'/g,
    "background: isWorkspaceMode ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff'"
  );

  // Replace main container background to standard gray
  content = content.replace(
    /<div style=\{\{ minHeight: '100vh', display: 'flex', backgroundColor: '#f1f5f9' \}\}>/g,
    "<div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f0f4f8' }}>"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Modified ' + filePath);
};

modifyFile('src/app/client/events/create/single-stage/page.tsx');
modifyFile('src/app/client/events/create/auction/page.tsx');

