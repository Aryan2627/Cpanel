const fs = require('fs');

function patchUsersPage() {
  const filePath = 'src/app/client/manage/users/page.tsx';
  let code = fs.readFileSync(filePath, 'utf8');

  // Add states
  if (!code.includes('isEditMode')) {
    code = code.replace(
      'const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);',
      'const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);\n  const [isEditMode, setIsEditMode] = useState(false);\n  const [editingUserId, setEditingUserId] = useState<string | null>(null);'
    );
  }

  // Update open modal button
  code = code.replace(
    'onClick={() => setIsCreateModalOpen(true)}',
    'onClick={() => { setIsEditMode(false); setEditingUserId(null); setFormData({ name: "", email: "", phone: "", role: "", erpId: "", status: "Active", department: "" }); setIsCreateModalOpen(true); }}'
  );

  // Update handleCreate
  if (code.includes('const res = await fetch(\'/api/users\', {') && !code.includes('method: isEditMode ? \'PUT\' : \'POST\'')) {
    code = code.replace(
      'const res = await fetch(\'/api/users\', {\n        method: \'POST\',',
      'const res = await fetch(\'/api/users\', {\n        method: isEditMode ? \'PUT\' : \'POST\','
    );
    code = code.replace(
      'body: JSON.stringify(formData)',
      'body: JSON.stringify(isEditMode ? { ...formData, id: editingUserId } : formData)'
    );
  }

  // Add handleEditUser
  if (!code.includes('handleEditUser')) {
    code = code.replace(
      'const handleDeleteUser',
      `const handleEditUser = (user: any) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      erpId: user.erpId || '',
      status: user.status || 'Active',
      department: user.department || ''
    });
    setEditingUserId(user.id);
    setIsEditMode(true);
    setIsCreateModalOpen(true);
  };

  const handleDeleteUser`
    );
  }

  // Add Edit button
  if (!code.includes('onClick={() => handleEditUser(user)}')) {
    code = code.replace(
      '<button onClick={() => handleDeleteUser(user.id)}',
      '<button onClick={() => handleEditUser(user)} style={{ padding: "6px 12px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "500", marginRight: "8px" }}>Edit</button>\n                      <button onClick={() => handleDeleteUser(user.id)}'
    );
  }

  // Update modal text
  code = code.replace(
    '<h2>Create New User</h2>',
    '<h2>{isEditMode ? "Edit User" : "Create New User"}</h2>'
  );
  
  // Actually the h2 doesn't have <h2>Create New User</h2>, it has:
  // <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: '700' }}>Create New User</h2>
  code = code.replace(
    '<h2 style={{ margin: 0, fontSize: \'1.25rem\', color: \'#111827\', fontWeight: \'700\' }}>Create New User</h2>',
    '<h2 style={{ margin: 0, fontSize: \'1.25rem\', color: \'#111827\', fontWeight: \'700\' }}>{isEditMode ? "Edit User" : "Create New User"}</h2>'
  );

  code = code.replace(
    '>\n                Create User\n              </button>',
    '>\n                {isEditMode ? "Save Changes" : "Create User"}\n              </button>'
  );

  fs.writeFileSync(filePath, code, 'utf8');
}

patchUsersPage();
console.log("Users page patched");
