'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTemplatePage() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<any[]>([
    { id: '1', name: 'Base Price', key: 'base_price', role: 'Participant', formula: '' }
  ]);

  const addField = () => {
    setFields([...fields, { id: Date.now().toString(), name: '', key: '', role: 'Participant', formula: '' }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleFieldChange = (id: string, prop: string, value: string) => {
    setFields(fields.map(f => {
      if (f.id === id) {
        return { ...f, [prop]: prop === 'key' ? value.toLowerCase().replace(/[^a-z0-9_]/g, '') : value };
      }
      return f;
    }));
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      alert("Please provide a template name.");
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: description || 'Custom User Template',
      fields: fields.map(f => ({ name: f.name, key: f.key, type: 'number', role: f.role, formula: f.formula })),
      createdAt: new Date().toISOString()
    };

    const saved = localStorage.getItem('customTemplates');
    const existing = saved ? JSON.parse(saved) : [];
    
    existing.push(newTemplate);
    localStorage.setItem('customTemplates', JSON.stringify(existing));
    
    // Dispatch event so other pages can update instantly
    window.dispatchEvent(new Event('templates_updated'));

    router.push('/client/manage/templates');
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8fafc', minHeight: '100%', margin: '-32px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '32px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Create Template</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Define the exact data fields you need from vendors.</p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Template Name</label>
              <input 
                type="text" 
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="e.g. IT Hardware Procurement"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Description</label>
              <input 
                type="text" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Short description for your team"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Template Fields</h3>
              <button 
                onClick={addField}
                style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#dbeafe'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
              >
                + Add Field
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {fields.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#94a3b8', fontStyle: 'italic' }}>
                  No fields added. Click "+ Add Field" to start.
                </div>
              ) : (
                fields.map((f, index) => (
                  <div key={f.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700 }}>
                      {index + 1}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Field Name</label>
                          <input 
                            type="text" 
                            value={f.name}
                            onChange={e => handleFieldChange(f.id, 'name', e.target.value)}
                            placeholder="e.g. Total Cost"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Unique Key</label>
                          <input 
                            type="text" 
                            value={f.key}
                            onChange={e => handleFieldChange(f.id, 'key', e.target.value)}
                            placeholder="e.g. total_cost"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                          />
                        </div>
                        <div style={{ width: '150px' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Filled By</label>
                          <select
                            value={f.role}
                            onChange={e => handleFieldChange(f.id, 'role', e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                          >
                            <option value="Participant">Vendor</option>
                            <option value="Creator">Internal Team</option>
                            <option value="Calculation">Calculation</option>
                          </select>
                        </div>
                      </div>
                      
                      {f.role === 'Calculation' && (
                        <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px dashed #4ade80', borderRadius: '6px' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', marginBottom: '4px', textTransform: 'uppercase' }}>Math Formula</label>
                          <input 
                            type="text" 
                            value={f.formula || ''}
                            onChange={e => handleFieldChange(f.id, 'formula', e.target.value)}
                            placeholder="e.g. base_price * qty"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace', color: '#15803d' }}
                          />
                          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px' }}>* Use the Unique Keys of other fields to calculate (e.g. base_price + tax)</div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => removeField(f.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.25rem', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Remove Field"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button 
            onClick={() => router.push('/client/manage/templates')}
            style={{ padding: '10px 24px', backgroundColor: 'transparent', color: '#64748b', border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{ padding: '10px 32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)', transition: 'transform 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Save Template
          </button>
        </div>

      </div>
    </div>
  );
}
