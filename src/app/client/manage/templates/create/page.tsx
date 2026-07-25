'use client';
import { useState } from 'react';

type TemplateField = {
  id: string;
  name: string;
  key: string;
  formula: string;
  role: 'Creator' | 'Participant';
};

export default function CreateTemplatePage() {
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState<TemplateField[]>([
    { id: '1', name: 'Base Price', key: 'base_price', formula: '', role: 'Participant' },
    { id: '2', name: 'GST (18%)', key: 'gst', formula: 'base_price * 0.18', role: 'Participant' },
    { id: '3', name: 'Total Value', key: 'total_value', formula: 'base_price + gst', role: 'Participant' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addField = () => {
    setFields([...fields, { 
      id: Date.now().toString(), 
      name: '', 
      key: '', 
      formula: '', 
      role: 'Participant' 
    }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, prop: keyof TemplateField, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, [prop]: value } : f));
  };

  const handleSave = async () => {
    if (!templateName) {
      alert("Please enter a Template Name.");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: templateName, fields })
      });
      if (res.ok) {
        window.location.href = '/client/manage/templates';
      } else {
        alert("Failed to save template.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving template.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Create a Template</h1>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
        >
          {isSaving ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      {/* Template Name */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Template Name</label>
        <input 
          type="text" 
          placeholder="e.g. Standard IT Hardware Procurement"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem', outline: 'none' }}
        />
      </div>

      {/* Fields List */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Template Fields</h2>
          <button 
            onClick={addField}
            style={{ padding: '6px 12px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            + Add Field
          </button>
        </div>
        
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
          Define the columns for this template. Use the <strong>Key</strong> to interlink fields using formulas (e.g. <code>base_price + gst</code>).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', gap: '16px', padding: '0 8px', fontWeight: '500', color: '#475569', fontSize: '0.875rem' }}>
            <div style={{ flex: '1.5' }}>Field Name</div>
            <div style={{ flex: '1' }}>Key Value</div>
            <div style={{ flex: '2' }}>Formula (optional)</div>
            <div style={{ flex: '1' }}>Access Role</div>
            <div style={{ width: '32px' }}></div>
          </div>

          {fields.map((field, idx) => (
            <div key={field.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              
              <div style={{ flex: '1.5' }}>
                <input 
                  type="text" 
                  placeholder="e.g. Total Value"
                  value={field.name}
                  onChange={(e) => updateField(field.id, 'name', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
                />
              </div>

              <div style={{ flex: '1' }}>
                <input 
                  type="text" 
                  placeholder="e.g. total_value"
                  value={field.key}
                  onChange={(e) => updateField(field.id, 'key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ flex: '2' }}>
                <input 
                  type="text" 
                  placeholder="e.g. base_price + gst"
                  value={field.formula}
                  onChange={(e) => updateField(field.id, 'formula', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontFamily: 'monospace', color: '#047857' }}
                />
              </div>

              <div style={{ flex: '1' }}>
                <select 
                  value={field.role}
                  onChange={(e) => updateField(field.id, 'role', e.target.value as any)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="Participant">Participant</option>
                  <option value="Creator">Creator</option>
                </select>
              </div>

              <div style={{ width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6px' }}>
                <button 
                  onClick={() => removeField(field.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
                  title="Remove field"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          
          {fields.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontStyle: 'italic' }}>
              No fields added yet. Click "+ Add Field" to start building your template.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
