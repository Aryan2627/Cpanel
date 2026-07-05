'use client';
import React, { useState, useEffect, useMemo } from 'react';

export default function TeamsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editUsersList, setEditUsersList] = useState<string[]>([]);
  const [categoryLimit, setCategoryLimit] = useState(true);
  const [locationLimit, setLocationLimit] = useState(false);

  const [teams, setTeams] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'Purchase',
    users: [] as string[],
    categories: [] as string[],
    locations: [] as string[]
  });

  const fetchAllData = async () => {
    try {
      const [tRes, uRes, cRes, lRes] = await Promise.all([
        fetch('/api/teams').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/locations').then(r => r.json())
      ]);
      setTeams(tRes || []);
      setAllUsers(uRes || []);
      setAllCategories(cRes || []);
      setAllLocations(lRes || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreate = async () => {
    if (!formData.name) {
      alert("Name is required");
      return;
    }
    try {
      await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsCreateModalOpen(false);
      setFormData({ name: '', type: 'Purchase', users: [], categories: [], locations: [] });
      setCategoryLimit(false);
      setLocationLimit(false);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChange = (field: 'users' | 'categories' | 'locations', val: string) => {
    if (!val) return;
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field] : [...prev[field], val]
    }));
  };

  const removeSelection = (field: 'users' | 'categories' | 'locations', val: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== val)
    }));
  };

  const openEditUserModal = (team: any) => {
    setEditingTeam(team);
    setEditUsersList(team.users || []);
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUsers = async () => {
    if (!editingTeam) return;
    try {
      await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: editUsersList })
      });
      setIsEditUserModalOpen(false);
      setEditingTeam(null);
      setEditUsersList([]);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return teams;
    const lowerQuery = searchQuery.toLowerCase();
    return teams.filter(team => 
      team.name?.toLowerCase().includes(lowerQuery) ||
      team.type?.toLowerCase().includes(lowerQuery)
    );
  }, [teams, searchQuery]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', minHeight: '100%', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
          
          {/* Search Section */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden', width: '280px' }}>
               <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', backgroundColor: '#fff', width: '100%' }}>
                  <input 
                    type="text" 
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '10px 0', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }} 
                  />
                  <span style={{ color: '#9ca3af', marginLeft: '8px' }}>dY"?</span>
               </div>
            </div>
            
            <button style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
              %
            </button>
          </div>
          
          {/* Create Button */}
          <div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
              + Create Team
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#eef2f6' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Team Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Team Type</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Members</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Categories</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Locations</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '24px' }}>Loading teams...</td></tr>
              ) : filteredTeams.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '24px', color: '#6b7280' }}>No teams found.</td></tr>
              ) : (
                filteredTeams.map((team, idx) => {
                  const firstUser = team.users && team.users.length > 0 ? team.users[0] : null;
                  const firstCat = team.categories && team.categories.length > 0 ? team.categories[0] : 'Have access to all categories.';
                  const firstLoc = team.locations && team.locations.length > 0 ? team.locations[0] : 'Have access to all locations.';
                  return (
                    <tr key={team.id || idx} style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{team.name}</td>
                      <td style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{team.type}</td>
                      <td 
                        onClick={() => openEditUserModal(team)}
                        style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        title="Click to edit users"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '24px', height: '24px', borderRadius: '50%', 
                            backgroundColor: '#fcd34d', color: '#fff', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: '0.65rem', fontWeight: 'bold' 
                          }}>
                            {firstUser ? firstUser.charAt(0).toUpperCase() : '-'}
                          </div>
                          {firstUser && <span>{firstUser}</span>}
                          {team.users && team.users.length > 1 && <span style={{ fontWeight: '600' }}>+{team.users.length - 1} more</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>
                        {firstCat} 
                        {team.categories && team.categories.length > 1 && <span style={{ fontWeight: '600' }}> +{team.categories.length - 1} more</span>}
                      </td>
                      <td style={{ padding: '16px 24px', color: '#4b5563' }}>
                        {firstLoc} 
                        {team.locations && team.locations.length > 1 && <span style={{ fontWeight: '600' }}> +{team.locations.length - 1} more</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end'
        }}>
          {/* Slide-out panel from the right */}
          <div style={{ 
            backgroundColor: '#fff', width: '500px', height: '100%', 
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Create Team</h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }}>
              
              {/* Name */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> Name
                </label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter team name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Team Type */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> Team Type
                </label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fff', color: '#374151', appearance: 'none' }}>
                  <option value="Purchase">Purchase</option>
                  <option value="Planner">Planner</option>
                  <option value="Auction">Auction</option>
                </select>
              </div>

              {/* Users */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>Associate Users</h3>
                <select 
                  onChange={e => handleSelectChange('users', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fff', color: '#374151', appearance: 'none', marginBottom: '8px' }}>
                  <option value="">Select a user...</option>
                  {allUsers.map((u: any) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.users.map((u, i) => (
                    <div key={i} style={{ padding: '4px 8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {u}
                      <span onClick={() => removeSelection('users', u)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>×</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>Categories</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 16px 0' }}>Team currently have access to all 909 categories</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div 
                    onClick={() => setCategoryLimit(!categoryLimit)}
                    style={{ 
                      width: '40px', height: '22px', borderRadius: '11px', 
                      backgroundColor: categoryLimit ? '#2563eb' : '#d1d5db', 
                      position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
                      position: 'absolute', top: '2px', left: categoryLimit ? '20px' : '2px', transition: 'left 0.2s'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.95rem', color: '#1f2937', fontWeight: '500' }}>Add category-based limitations</span>
                </div>

                {categoryLimit && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      <span style={{ color: '#ef4444' }}>*</span> Add Category
                    </label>
                    <select 
                      onChange={e => handleSelectChange('categories', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fff', color: '#374151', appearance: 'none', marginBottom: '8px' }}>
                      <option value="">Select a category...</option>
                      {allCategories.map((c: any) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {formData.categories.map((c, i) => (
                        <div key={i} style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {c}
                          <span onClick={() => removeSelection('categories', c)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>×</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Locations */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>Locations</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 16px 0' }}>Team currently have access to all 79 locations</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div 
                    onClick={() => {
                      setLocationLimit(!locationLimit);
                      if (locationLimit) setFormData({ ...formData, locations: [] });
                    }}
                    style={{ 
                      width: '40px', height: '22px', borderRadius: '11px', 
                      backgroundColor: locationLimit ? '#2563eb' : '#d1d5db', 
                      position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
                      position: 'absolute', top: '2px', left: locationLimit ? '20px' : '2px', transition: 'left 0.2s'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.95rem', color: '#1f2937', fontWeight: '500' }}>Add location-based limitations</span>
                </div>

                {locationLimit && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      <span style={{ color: '#ef4444' }}>*</span> Add Location
                    </label>
                    <select 
                      onChange={e => handleSelectChange('locations', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fff', color: '#374151', appearance: 'none', marginBottom: '8px' }}>
                      <option value="">Select a location...</option>
                      {allLocations.map((l: any) => (
                        <option key={l.id} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {formData.locations.map((l, i) => (
                        <div key={i} style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {l}
                          <span onClick={() => removeSelection('locations', l)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>×</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f9fafb' }}>
               <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!formData.name}
                  style={{ padding: '10px 24px', border: 'none', borderRadius: '4px', backgroundColor: !formData.name ? '#94a3b8' : '#2563eb', color: '#fff', cursor: !formData.name ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                  Submit
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Users Modal */}
      {isEditUserModalOpen && editingTeam && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end'
        }}>
          {/* Slide-out panel from the right */}
          <div style={{ 
            backgroundColor: '#fff', width: '500px', height: '100%', 
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Edit Users for {editingTeam.name}</h2>
              <button onClick={() => setIsEditUserModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }}>
              
              {/* Users */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>Associate Users</h3>
                <select 
                  onChange={e => {
                    const val = e.target.value;
                    if (val && !editUsersList.includes(val)) {
                      setEditUsersList([...editUsersList, val]);
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fff', color: '#374151', appearance: 'none', marginBottom: '8px' }}>
                  <option value="">Select a user...</option>
                  {allUsers.map((u: any) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {editUsersList.map((u, i) => (
                    <div key={i} style={{ padding: '4px 8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {u}
                      <span onClick={() => setEditUsersList(editUsersList.filter(item => item !== u))} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>×</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f9fafb' }}>
               <button 
                  onClick={() => setIsEditUserModalOpen(false)}
                  style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateUsers}
                  style={{ padding: '10px 24px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                  Save Users
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
