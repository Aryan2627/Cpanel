const fs = require('fs');
let code = fs.readFileSync('src/app/client/manage/users/page.tsx', 'utf8');

// Update handleCreate logic
const oldHandleCreate = `const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      alert("Name, Email, Phone, and Role are required.");
      return;
    }
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', phone: '', role: '', erpId: '', status: 'Active', department: '' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };`;

const newHandleCreate = `const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      alert("Name, Email, Phone, and Role are required.");
      return;
    }
    try {
      const url = '/api/users';
      const method = isEditMode ? 'PUT' : 'POST';
      const bodyData = isEditMode ? { ...formData, id: editingUserId } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) { 
        const errData = await res.json(); 
        throw new Error(errData.error || 'Failed to save'); 
      }

      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', phone: '', role: '', erpId: '', status: 'Active', department: '' });
      setIsEditMode(false);
      setEditingUserId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
      console.error(err);
    }
  };`;

code = code.replace(oldHandleCreate, newHandleCreate);

// If the oldHandleCreate wasn't found (maybe due to my previous patch modifying the error handling), let's use a regex or replace the function body
if(code.indexOf(oldHandleCreate) === -1) {
  const matchStart = "const handleCreate = async () => {";
  const matchEnd = "const handleSelectRow = (id: number) => {";
  const startIdx = code.indexOf(matchStart);
  const endIdx = code.indexOf(matchEnd);
  if(startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + newHandleCreate + "\n\n  " + code.substring(endIdx);
  }
}

// Update the save button text
code = code.replace(
  '>\n                Create User\n              </button>',
  '>\n                {isEditMode ? "Save Changes" : "Create User"}\n              </button>'
);

fs.writeFileSync('src/app/client/manage/users/page.tsx', code, 'utf8');
console.log("Patched Users frontend for editing");
