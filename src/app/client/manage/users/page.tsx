'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function UsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: '', erpId: '', status: 'Active', department: '' });

  const [searchField, setSearchField] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert('Failed to delete user');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting user');
    }
  };

  useEffect(() => {
    fetchUsers();
    
    const loadDepartments = () => {
      const saved = localStorage.getItem('customDropdowns');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDepartments(parsed.departments || []);
        } catch (e) {}
      }
    };
    
    loadDepartments();
    window.addEventListener('customDropdowns_updated', loadDepartments);
    return () => window.removeEventListener('customDropdowns_updated', loadDepartments);
  }, []);

  const handleCreate = async () => {
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
  };

  const handleSelectRow = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(u => {
      if (searchField === 'name') {
        return u.name?.toLowerCase().includes(lowerQuery);
      } else if (searchField === 'email') {
        return u.email?.toLowerCase().includes(lowerQuery);
      } else if (searchField === 'phone') {
        return u.phone?.toLowerCase().includes(lowerQuery);
      } else if (searchField === 'role') {
        return u.role?.toLowerCase().includes(lowerQuery);
      }
      return true;
    });
  }, [users, searchQuery, searchField]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', minHeight: '100%', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            
            {/* Search Section */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
               <select 
                 value={searchField}
                 onChange={(e) => setSearchField(e.target.value)}
                 style={{ padding: '8px 12px', border: 'none', borderRight: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontSize: '0.85rem' }}
               >
                 <option value="name">Name</option>
                 <option value="email">Email</option>
                 <option value="phone">Phone</option>
                 <option value="role">Role</option>
               </select>
               <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', backgroundColor: '#fff' }}>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search by ${searchField}`}
                    style={{ padding: '8px', border: 'none', outline: 'none', width: '220px', fontSize: '0.85rem' }} 
                  />
                  <span style={{ color: '#9ca3af' }}></span>
               </div>
            </div>
            
            {/* Filter & Tag Buttons */}
            <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#f9fafb', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              ≡ <span style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>1</span>
            </button>
            
            <button disabled style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
               Add Tag
            </button>
          </div>
          
          <div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
              + Create User
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#eef2f6' }}>
                <th style={{ padding: '16px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Phone</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center' }}>Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{user.name}</td>
                    <td style={{ padding: '16px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{user.email}</td>
                    <td style={{ padding: '16px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{user.phone}</td>
                    <td id="tour-user-roles" style={{ padding: '16px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>
                      <span style={{ 
                        backgroundColor: user.role === 'Super Admin' ? '#fef2f2' : user.role === 'Manager' ? '#f0fdf4' : '#eff6ff', 
                        color: user.role === 'Super Admin' ? '#dc2626' : user.role === 'Manager' ? '#16a34a' : '#2563eb', 
                        padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' 
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#4b5563' }}>{user.status}</td>
                    <td style={{ padding: '16px', color: '#4b5563' }}>
                      <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '6px 12px', border: '1px solid #ef4444', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          zIndex: 50,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Slide-out panel from the right */}
          <div style={{ 
            backgroundColor: '#fff', width: '500px', height: '100%', 
            boxShadow: '-10px 0 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
            animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: '700' }}>Create New User</h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: '#e2e8f0', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#475569', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#cbd5e1'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}></button>
            </div>
            
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              
              {/* Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> Name :
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter user's name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} 
                />
              </div>

              {/* ERP ID */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  ERP ID :
                </label>
                <input 
                  type="text" 
                  value={formData.erpId}
                  onChange={e => setFormData({ ...formData, erpId: e.target.value })}
                  placeholder="Enter ERP ID"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Role */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> Role :
                </label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff', color: formData.role ? '#374151' : '#9ca3af', appearance: 'none' }}>
                  <option value="">Enter user's role</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> Email :
                </label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter user's email address"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> Phone :
                </label>
                <div style={{ display: 'flex', borderRadius: '4px', border: '1px solid #d1d5db', overflow: 'hidden' }}>
                  <select style={{ padding: '10px 12px', border: 'none', borderRight: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', color: '#374151', fontSize: '0.9rem', appearance: 'none' }}>
                    <option>+91</option>
                  </select>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter user's phone number"
                    style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', color: '#111827', margin: '0 0 16px 0' }}>Assign Department</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Department :
                </label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff', color: formData.department ? '#374151' : '#9ca3af', appearance: 'none' }}>
                    <option value="">Select Department</option>
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
            
            <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f9fafb' }}>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                Cancel
              </button>
              <button 
                id="tour-save-user-btn"
                onClick={handleCreate}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', color: '#fff', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 10px rgba(37, 99, 235, 0.3)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.2)'; }}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
