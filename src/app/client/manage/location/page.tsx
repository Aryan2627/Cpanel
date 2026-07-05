'use client';
import React, { useState, useEffect, useMemo } from 'react';

export default function LocationPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', city: '', type: 'Buying Hub', address: '', code: '', status: 'Active' });

  // Grid Filter State
  const [locationSearchField, setLocationSearchField] = useState('name');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // City Autocomplete State
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Debounce city search
  useEffect(() => {
    if (!citySearch || citySearch === formData.city) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearchingCity(true);
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=5`);
        const data = await res.json();
        if (data.results) {
          setCityResults(data.results);
          setShowCityDropdown(true);
        } else {
          setCityResults([]);
          setShowCityDropdown(false);
        }
      } catch (err) {
        console.error("Failed to fetch cities", err);
      } finally {
        setIsSearchingCity(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [citySearch, formData.city]);

  const selectCity = (cityName: string) => {
    setFormData({ ...formData, city: cityName });
    setCitySearch(cityName);
    setShowCityDropdown(false);
  };

  const fetchLocations = () => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.city) {
      alert("Name and City are required.");
      return;
    }
    try {
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsCreateModalOpen(false);
      setFormData({ name: '', city: '', type: 'Buying Hub', address: '', code: '', status: 'Active' });
      setCitySearch('');
      fetchLocations();
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = (type: string) => {
    setFormData({ name: '', city: '', type, address: '', code: '', status: 'Active' });
    setCitySearch('');
    setIsCreateModalOpen(true);
  };

  const filteredLocations = useMemo(() => {
    if (!locationSearchQuery) return locations;
    const lowerQuery = locationSearchQuery.toLowerCase();
    return locations.filter(loc => {
      if (locationSearchField === 'name') {
        return loc.name?.toLowerCase().includes(lowerQuery);
      } else if (locationSearchField === 'city') {
        return loc.city?.toLowerCase().includes(lowerQuery);
      } else if (locationSearchField === 'type') {
        return loc.type?.toLowerCase().includes(lowerQuery);
      }
      return true;
    });
  }, [locations, locationSearchQuery, locationSearchField]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', minHeight: '100%', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
          
          {/* Search Section */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
             <select 
               value={locationSearchField}
               onChange={(e) => setLocationSearchField(e.target.value)}
               style={{ padding: '8px 12px', border: 'none', borderRight: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontSize: '0.85rem' }}
             >
               <option value="name">Name</option>
               <option value="city">City</option>
               <option value="type">Type</option>
             </select>
             <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', backgroundColor: '#fff' }}>
                <input 
                  type="text" 
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  placeholder="Search Location"
                  style={{ padding: '8px', border: 'none', outline: 'none', width: '220px', fontSize: '0.85rem' }} 
                />
                <span style={{ color: '#9ca3af' }}>dY"?</span>
             </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
               ئ Bulk Upload
            </button>
            <button 
              onClick={() => openCreateModal('Buying Hub')}
              style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
              + Create Buying Hub
            </button>
            <button 
              onClick={() => openCreateModal('Delivery Center')}
              style={{ padding: '8px 16px', border: '1px solid #2563eb', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
              + Create Delivery Center
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#eef2f6' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', textAlign: 'left' }}>
                  Name <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '4px' }}>+ </span>
                </th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', textAlign: 'left' }}>Address</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Location type</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Location code</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>City</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '24px' }}>Loading locations...</td></tr>
              ) : filteredLocations.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '24px', color: '#6b7280' }}>No locations found.</td></tr>
              ) : (
                filteredLocations.map((loc, idx) => (
                  <tr key={loc.id || idx} style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb', textAlign: 'left' }}>{loc.name}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb', textAlign: 'left' }}>{loc.address || '-'}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{loc.type}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{loc.code || '-'}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{loc.status}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{loc.city}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563' }}>
                      <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Location Modal */}
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
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Create {formData.type}</h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }}>
              
              {/* City Autocomplete */}
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> City :
                </label>
                <input 
                  type="text"
                  value={citySearch}
                  onChange={e => {
                    setCitySearch(e.target.value);
                    if (e.target.value === '') setFormData({ ...formData, city: '' });
                  }}
                  onFocus={() => {
                     if (cityResults.length > 0) setShowCityDropdown(true);
                  }}
                  placeholder="Start typing a city name..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} 
                />
                {isSearchingCity && <div style={{ position: 'absolute', right: '12px', top: '38px', fontSize: '0.8rem', color: '#6b7280' }}>Loading...</div>}
                
                {/* Dropdown */}
                {showCityDropdown && cityResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderTop: 'none', borderRadius: '0 0 4px 4px', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    {cityResults.map((result: any, idx) => (
                      <div 
                        key={idx}
                        onClick={() => selectCity(result.name)}
                        style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem', color: '#374151' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                      >
                        <span style={{ fontWeight: '500' }}>{result.name}</span>
                        {result.admin1 && <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '6px' }}>, {result.admin1}</span>}
                        {result.country && <span style={{ color: '#9ca3af', fontSize: '0.8rem', marginLeft: '6px' }}>({result.country})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Name */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> Name :
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter location name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} 
                />
              </div>



              {/* Address */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Address :
                </label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter location address"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Location Code */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Location code :
                </label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter location code"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} 
                />
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
                  disabled={!formData.name || !formData.city}
                  style={{ padding: '10px 24px', border: 'none', borderRadius: '4px', backgroundColor: (!formData.name || !formData.city) ? '#9ca3af' : '#2563eb', color: '#fff', cursor: (!formData.name || !formData.city) ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                  Save
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
