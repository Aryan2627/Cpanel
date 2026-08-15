'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GripVertical, Plus, Trash2, ArrowUp, ArrowDown, Info, Save, X, Eye, Wand2, Leaf, Settings } from 'lucide-react';

export default function CreateTemplatePage() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState('RFQ');
  const [enableESG, setEnableESG] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const [fields, setFields] = useState<any[]>([
    { 
      id: '1', 
      name: 'Base Price', 
      key: 'base_price', 
      type: 'number', 
      dropdownOptions: '', 
      role: 'Participant', 
      formula: '',
      section: 'Pricing',
      required: true,
      tooltip: 'Enter your best base price per unit.',
      weight: 100,
      dependsOn: '',
      dependsOnValue: '',
      targetPrice: '',
      validationRule: '',
      autoFill: false,
      showAdvanced: false
    }
  ]);

  const addField = () => {
    setFields([...fields, { 
      id: Date.now().toString(), 
      name: 'New Field', 
      key: `field_${Date.now()}`, 
      type: 'number', 
      dropdownOptions: '', 
      role: 'Participant', 
      formula: '',
      section: 'General',
      required: false,
      tooltip: '',
      weight: 0,
      dependsOn: '',
      dependsOnValue: '',
      targetPrice: '',
      validationRule: '',
      autoFill: false,
      showAdvanced: false
    }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    setFields(newFields);
  };

  const handleFieldChange = (id: string, prop: string, value: any) => {
    setFields(fields.map(f => {
      if (f.id === id) {
        return { ...f, [prop]: prop === 'key' ? value.toLowerCase().replace(/[^a-z0-9_]/g, '') : value };
      }
      return f;
    }));
  };

  const toggleAdvanced = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, showAdvanced: !f.showAdvanced } : f));
  };

  const handleGenerateAI = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setTemplateName("Global IT Hardware Procurement (AI Generated)");
      setDescription("Automated template for procuring enterprise servers and laptops, generated via Procurement AI.");
      setEnableESG(true);
      setFields([
        { id: 'f1', name: 'Vendor Name', key: 'vendor_name', type: 'text', role: 'Participant', section: 'Company Info', required: true, tooltip: '', weight: 0, autoFill: true, showAdvanced: false },
        { id: 'f2', name: 'Tax ID (VAT)', key: 'tax_id', type: 'text', role: 'Participant', section: 'Company Info', required: true, tooltip: 'Must be a valid VAT number', weight: 0, validationRule: 'tax_id', showAdvanced: false },
        { id: 'f3', name: 'ISO 9001 Certificate', key: 'iso_cert', type: 'file', role: 'Participant', section: 'Compliance', required: true, tooltip: 'Upload valid PDF certificate', weight: 10, showAdvanced: false },
        { id: 'f4', name: 'Includes Installation?', key: 'inc_install', type: 'dropdown', dropdownOptions: 'Yes, No', role: 'Participant', section: 'Services', required: true, tooltip: '', weight: 0, showAdvanced: false },
        { id: 'f5', name: 'Installation Cost', key: 'install_cost', type: 'number', role: 'Participant', section: 'Services', required: true, tooltip: '', weight: 10, dependsOn: 'inc_install', dependsOnValue: 'Yes', targetPrice: '500', showAdvanced: false },
        { id: 'f6', name: 'Server Hardware Price', key: 'hw_price', type: 'number', role: 'Participant', section: 'Pricing', required: true, tooltip: 'Base unit cost', weight: 60, targetPrice: '2000', showAdvanced: false },
        { id: 'f7', name: 'Steel Chassis (LME Index)', key: 'steel_chassis', type: 'commodity', role: 'Participant', section: 'Pricing', required: true, tooltip: 'Steel Price Index applied automatically', weight: 20, showAdvanced: false },
        { id: 'f8', name: 'Labor Breakdown', key: 'labor_breakdown', type: 'table', role: 'Participant', section: 'Pricing', required: false, tooltip: 'Detailed breakdown', weight: 0, showAdvanced: false },
      ]);
      setIsGeneratingAI(false);
    }, 1500);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      alert("Please provide a template name.");
      return;
    }
    try {
      const payloadFields = fields.map(f => {
        const { showAdvanced, ...rest } = f; // Remove UI-only state
        return { ...rest, type: rest.type || 'number', section: rest.section || 'General', enableESG };
      });

      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          type: templateType,
          fields: payloadFields
        })
      });
      if (!res.ok) throw new Error('Failed to save template');
      window.dispatchEvent(new Event('templates_updated'));
      router.push('/client/manage/templates');
    } catch (err) {
      console.error(err);
      alert('Error saving template');
    }
  };

  const sections = Array.from(new Set(fields.map(f => f.section || 'General')));

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100%', margin: '-24px', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: '#fff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Advanced Template Builder</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Design smart procurement forms with live preview</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleGenerateAI}
            disabled={isGeneratingAI}
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(168, 85, 247, 0.2)' }}
          >
            <Wand2 size={18} /> {isGeneratingAI ? 'Generating...' : 'Auto-Generate with AI'}
          </button>
          <button 
            onClick={() => router.push('/client/manage/templates')}
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
          >
            <X size={18} /> Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
          >
            <Save size={18} /> Save Template
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 180px)' }}>
        
        {/* LEFT PANE: BUILDER */}
        <div style={{ flex: '1 1 55%', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Template Configuration</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="esg-toggle" checked={enableESG} onChange={e => setEnableESG(e.target.checked)} style={{ cursor: 'pointer' }} />
              <label htmlFor="esg-toggle" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#16a34a', cursor: 'pointer' }}>
                <Leaf size={16} /> Enable ESG Carbon Calculation
              </label>
            </div>
          </div>
          
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Template Name <span style={{color: '#ef4444'}}>*</span></label>
                <input 
                  type="text" 
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="e.g. Server Infrastructure RFP"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Description</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Internal description..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Template Category</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="radio" name="templateType" checked={templateType === 'Technical'} onChange={() => setTemplateType('Technical')} /> Technical
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="radio" name="templateType" checked={templateType === 'RFQ'} onChange={() => setTemplateType('RFQ')} /> Commercial (RFQ)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="radio" name="templateType" checked={templateType === 'Auction'} onChange={() => setTemplateType('Auction')} /> Reverse Auction
                </label>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Form Fields</h3>
                <button 
                  onClick={addField}
                  style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Add Field
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {fields.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    No fields added yet.
                  </div>
                ) : (
                  fields.map((f, index) => (
                    <div key={f.id} style={{ display: 'flex', gap: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', position: 'relative' }}>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                        <button onClick={() => moveField(index, 'up')} disabled={index === 0} style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#e2e8f0' : '#64748b', padding: 0 }}><ArrowUp size={16} /></button>
                        <GripVertical size={16} style={{ cursor: 'grab' }} />
                        <button onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1} style={{ background: 'none', border: 'none', cursor: index === fields.length - 1 ? 'not-allowed' : 'pointer', color: index === fields.length - 1 ? '#e2e8f0' : '#64748b', padding: 0 }}><ArrowDown size={16} /></button>
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        
                        {/* Essential Settings (Always Visible) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr', gap: '12px', alignItems: 'end' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Field Label</label>
                            <input type="text" value={f.name} onChange={e => handleFieldChange(f.id, 'name', e.target.value)} placeholder="e.g. Warranty Cost" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Unique Key</label>
                            <input type="text" value={f.key} onChange={e => handleFieldChange(f.id, 'key', e.target.value)} placeholder="warranty_cost" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', fontFamily: 'monospace' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Input Type</label>
                            <select value={f.type || 'number'} onChange={e => handleFieldChange(f.id, 'type', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', backgroundColor: '#fff' }}>
                              <option value="number">Number</option>
                              <option value="text">Text</option>
                              <option value="percentage">Percentage</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="file">File Upload</option>
                              <option value="table">Multi-Row Table</option>
                              <option value="commodity">Live Index (Commodity)</option>
                            </select>
                          </div>
                          <div style={{ paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input type="checkbox" id={`req-${f.id}`} checked={f.required} onChange={e => handleFieldChange(f.id, 'required', e.target.checked)} />
                            <label htmlFor={`req-${f.id}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Required</label>
                          </div>
                        </div>

                        {/* Advanced Settings Toggle */}
                        <div>
                          <button 
                            onClick={() => toggleAdvanced(f.id)} 
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: 0 }}
                          >
                            <Settings size={14} /> {f.showAdvanced ? 'Hide Advanced Settings' : 'Advanced Settings'}
                          </button>
                        </div>

                        {/* Advanced Settings Block (Hidden by default) */}
                        {f.showAdvanced && (
                          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Filled By (Role)</label>
                                <select value={f.role} onChange={e => handleFieldChange(f.id, 'role', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', backgroundColor: '#fff' }}>
                                  <option value="Participant">Vendor</option>
                                  <option value="Creator">Buyer</option>
                                  <option value="Calculation">Formula</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Grouping Section</label>
                                <input type="text" value={f.section || ''} onChange={e => handleFieldChange(f.id, 'section', e.target.value)} placeholder="e.g. Tech Specs" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Helper Tooltip</label>
                                <input type="text" value={f.tooltip || ''} onChange={e => handleFieldChange(f.id, 'tooltip', e.target.value)} placeholder="Help text for vendor..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Weight (Scoring %)</label>
                                <input type="number" value={f.weight || 0} onChange={e => handleFieldChange(f.id, 'weight', parseFloat(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Hidden Target Price ($)</label>
                                <input type="number" value={f.targetPrice || ''} onChange={e => handleFieldChange(f.id, 'targetPrice', e.target.value)} placeholder="Max Budget" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Smart Validation</label>
                                <select value={f.validationRule || ''} onChange={e => handleFieldChange(f.id, 'validationRule', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', backgroundColor: '#fff' }}>
                                  <option value="">None</option>
                                  <option value="tax_id">Govt Tax ID / VAT</option>
                                  <option value="address">Address Verification</option>
                                </select>
                              </div>
                              <div style={{ paddingTop: '18px' }}>
                                <input type="checkbox" id={`af-${f.id}`} checked={f.autoFill} onChange={e => handleFieldChange(f.id, 'autoFill', e.target.checked)} />
                                <label htmlFor={`af-${f.id}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginLeft: '6px' }}>Enable Auto-Fill</label>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Conditional Logic: Depends On</label>
                                <input type="text" value={f.dependsOn || ''} onChange={e => handleFieldChange(f.id, 'dependsOn', e.target.value)} placeholder="e.g. inc_install" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Depends Value</label>
                                <input type="text" value={f.dependsOnValue || ''} onChange={e => handleFieldChange(f.id, 'dependsOnValue', e.target.value)} placeholder="e.g. Yes" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }} />
                              </div>
                            </div>

                            {/* Dynamic Render based on Type */}
                            {f.role === 'Calculation' && (
                              <div style={{ padding: '8px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '4px' }}>
                                <input type="text" value={f.formula || ''} onChange={e => handleFieldChange(f.id, 'formula', e.target.value)} placeholder="Formula (e.g. base_price * qty)" style={{ width: '100%', padding: '6px', border: 'none', background: 'transparent', fontSize: '0.85rem', outline: 'none', fontFamily: 'monospace' }} />
                              </div>
                            )}
                            {f.type === 'dropdown' && (
                              <div style={{ padding: '8px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                <input type="text" value={f.dropdownOptions || ''} onChange={e => handleFieldChange(f.id, 'dropdownOptions', e.target.value)} placeholder="Options (e.g. Yes:10, No:0)" style={{ width: '100%', padding: '6px', border: 'none', fontSize: '0.85rem', outline: 'none' }} />
                              </div>
                            )}
                            {f.type === 'commodity' && (
                              <div style={{ padding: '8px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                <select style={{ width: '100%', padding: '6px', border: 'none', fontSize: '0.85rem', outline: 'none', backgroundColor: '#fff' }}>
                                  <option>LME Copper</option>
                                  <option>LME Steel Billet</option>
                                  <option>Brent Crude Oil</option>
                                </select>
                              </div>
                            )}

                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button onClick={() => removeField(f.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                        <Trash2 size={18} />
                      </button>

                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div style={{ flex: '1 1 45%', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="#64748b" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Live Vendor Preview</h2>
            </div>
            <select style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }}>
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
          
          <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
            
            <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#0f172a' }}>{templateName || 'Untitled Template'}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{description || 'Vendor response form'}</p>
                </div>
                {enableESG && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Leaf size={16} /> ESG Tracked
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {sections.map(section => {
                  const sectionFields = fields.filter(f => (f.section || 'General') === section);
                  if (sectionFields.length === 0) return null;

                  return (
                    <div key={section} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                        {section}
                      </div>
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {sectionFields.map(f => (
                          <div key={`preview-${f.id}`} style={{ opacity: f.dependsOn ? 0.6 : 1 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                              {f.name || 'Unnamed Field'} 
                              {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                              {f.autoFill && <span style={{ color: '#3b82f6', fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#eff6ff', borderRadius: '4px' }}>Auto-Fill</span>}
                              {f.tooltip && (
                                <div title={f.tooltip} style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', cursor: 'help' }}>
                                  <Info size={14} />
                                </div>
                              )}
                              {f.dependsOn && (
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: 'auto' }}>
                                  Shows if {f.dependsOn} = {f.dependsOnValue}
                                </span>
                              )}
                            </label>
                            
                            {f.role === 'Calculation' ? (
                              <div style={{ width: '100%', padding: '10px 12px', backgroundColor: '#e2e8f0', color: '#64748b', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', fontStyle: 'italic' }}>
                                Auto-calculated ({f.formula})
                              </div>
                            ) : f.type === 'dropdown' ? (
                              <select style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }}>
                                <option value="">Select option...</option>
                                {f.dropdownOptions?.split(',').map((opt: string, i: number) => {
                                  const label = opt.includes(':') ? opt.split(':')[0] : opt;
                                  return <option key={i} value={label.trim()}>{label.trim()}</option>;
                                })}
                              </select>
                            ) : f.type === 'file' ? (
                              <input type="file" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px dashed #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }} />
                            ) : f.type === 'table' ? (
                              <div style={{ width: '100%', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                [Multi-Row Table Interface will render here]
                              </div>
                            ) : f.type === 'commodity' ? (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Index + </span>
                                <input type="number" placeholder="Vendor Markup..." style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }} />
                              </div>
                            ) : (
                              <div style={{ position: 'relative' }}>
                                {f.type === 'percentage' && <span style={{ position: 'absolute', right: '12px', top: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>%</span>}
                                {f.type === 'number' && <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>#</span>}
                                <input 
                                  type={f.type === 'number' || f.type === 'percentage' ? 'number' : 'text'} 
                                  placeholder={f.role === 'Creator' ? 'Pre-filled by Buyer' : f.validationRule ? `Enter valid ${f.validationRule}...` : 'Enter value...'}
                                  disabled={f.role === 'Creator'}
                                  style={{ 
                                    width: '100%', 
                                    padding: `10px 12px 10px ${f.type === 'number' ? '28px' : '12px'}`, 
                                    borderRadius: '6px', 
                                    border: '1px solid #cbd5e1', 
                                    fontSize: '0.9rem', 
                                    outline: 'none',
                                    backgroundColor: f.role === 'Creator' ? '#f1f5f9' : '#fff',
                                    color: f.role === 'Creator' ? '#94a3b8' : '#0f172a'
                                  }} 
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button disabled style={{ padding: '10px 24px', backgroundColor: '#e2e8f0', color: '#94a3b8', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'not-allowed' }}>
                  Submit Bid (Preview)
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
