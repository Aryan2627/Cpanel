'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIntake } from '@/context/IntakeContext';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { CheckCircle2, AlertCircle, FileCheck, Users, Clock, Settings, Search, LayoutTemplate, Plus, ShieldCheck, ChevronDown, X, GripVertical } from 'lucide-react';

function SingleStageCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get('title') || '';
  
  const [title, setTitle] = useState(initialTitle);
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [feedbackMode, setFeedbackMode] = useState('Sealed');
  const { intakes } = useIntake();
  const [isWorkspaceMode, setIsWorkspaceMode] = useState(false);
  
  const [showTinderMatchmaking, setShowTinderMatchmaking] = useState(false);
  const [isTinderModalOpen, setIsTinderModalOpen] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('godTierFeatures');
      if (saved) {
        const features = JSON.parse(saved);
        if (features.tinderMatchmaking !== undefined) {
          setShowTinderMatchmaking(features.tinderMatchmaking);
        }
      }
    } catch (e) {}
  }, []);
  
  // States for Event Type and Templates
  const [eventType, setEventType] = useState('Rank based');
  const [japStartPrice, setJapStartPrice] = useState('');
  const [japDropAmount, setJapDropAmount] = useState('');
  const [japTickInterval, setJapTickInterval] = useState('');
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  
  const [template, setTemplate] = useState('Select Templates');
  const [selectedTemplateObj, setSelectedTemplateObj] = useState<any>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);

  // Multi-Stage State
  const fromPR = searchParams.get('fromPR') === 'true';
  const [lineItems, setLineItems] = useState<any[]>([{ id: Date.now(), values: {}, evaluatorId: '' }]);
  const techParam = searchParams.get('tech') === 'true';
  const rfqParam = searchParams.get('rfq') === 'true';
  const auctionParam = searchParams.get('auction') === 'true';

  const [enableTechnical, setEnableTechnical] = useState(fromPR ? techParam : true);
  const [technicalTemplate, setTechnicalTemplate] = useState('Select Templates');
  const [selectedTechnicalTemplateObj, setSelectedTechnicalTemplateObj] = useState<any>(null);
  const [isTechnicalTemplateOpen, setIsTechnicalTemplateOpen] = useState(false);

  const [enableRFQ, setEnableRFQ] = useState(fromPR ? rfqParam : true);
  const [rfqTemplate, setRfqTemplate] = useState('Select Templates');
  const [selectedRfqTemplateObj, setSelectedRfqTemplateObj] = useState<any>(null);
  const [isRfqTemplateOpen, setIsRfqTemplateOpen] = useState(false);

  const [enableAuction, setEnableAuction] = useState(fromPR ? auctionParam : false);
  const [auctionTemplate, setAuctionTemplate] = useState('Select Templates');
  const [selectedAuctionTemplateObj, setSelectedAuctionTemplateObj] = useState<any>(null);
  const [isAuctionTemplateOpen, setIsAuctionTemplateOpen] = useState(false);

  // State for dynamic creator fields
  
  const getMultipliedFields = (baseFields: any[], items: any[], isPR: boolean) => {
    if (!items || items.length === 0) return baseFields;
    if (!isPR && items.length === 1 && !items[0].values['Item Name']) return baseFields;
    
    const flatFields: any[] = [];
    items.forEach((item: any, idx: number) => {
      const itemName = item.values['Item Name'] || `Item ${idx+1}`;
      baseFields.forEach((f: any) => {
        const newField = { ...f, key: `${item.id}_${f.key}`, originalKey: f.key, originalName: f.name, _sourceItemId: item.id };
        if (items.length > 1 || isPR) {
          newField.name = `${itemName} - ${f.name}`;
        }
        flatFields.push(newField);
      });
    });
    return flatFields;
  };

  const [creatorData, setCreatorData] = useState<Record<string, string>>({});
  useEffect(() => {
    if (fromPR && lineItems.length > 0) {
       let allFields: any[] = [];
       try {
           if (selectedTechnicalTemplateObj) allFields = [...allFields, ...JSON.parse(selectedTechnicalTemplateObj.fields)];
           if (selectedRfqTemplateObj) allFields = [...allFields, ...JSON.parse(selectedRfqTemplateObj.fields)];
           if (selectedAuctionTemplateObj) allFields = [...allFields, ...JSON.parse(selectedAuctionTemplateObj.fields)];
           
           const mFields = getMultipliedFields(allFields, lineItems, fromPR);
           const creatorFields = mFields.filter((f: any) => f.role === 'Creator');
           if (creatorFields.length > 0) {
               setCreatorData(prev => {
                   const newData = { ...prev };
                   let changed = false;
                   creatorFields.forEach((f: any) => {
                       const item = lineItems.find(i => i.id === f._sourceItemId);
                       if (!item) return;
                       
                       if (f.type === 'product' && !newData[f.key]) { newData[f.key] = item.values['Item Name']; changed = true; }
                       else {
                           const ln = (f.originalKey || f.name || '').toLowerCase();
                           if ((ln.includes('product') || ln.includes('item')) && !newData[f.key]) { newData[f.key] = item.values['Item Name']; changed = true; }
                           else if ((ln.includes('quantity') || ln === 'qty') && !newData[f.key]) { newData[f.key] = item.values['Quantity']; changed = true; }
                           if ((ln.includes('uom') || ln.includes('unit')) && !newData[f.key]) { newData[f.key] = item.values['UOM']; changed = true; }
                           if (ln.includes('code') && !newData[f.key]) { newData[f.key] = item.values['Product Code']; changed = true; }
                           if (ln.includes('category') && !newData[f.key]) { newData[f.key] = item.values['Category']; changed = true; }
                       }
                   });
                   return changed ? newData : prev;
               });
           }
       } catch(e) {}
    }
  }, [selectedTechnicalTemplateObj, selectedRfqTemplateObj, selectedAuctionTemplateObj, fromPR, lineItems]);

  
  // State for Event Duration
  const [durationValue, setDurationValue] = useState('');
  const [minBidStep, setMinBidStep] = useState('');
  const [ceilingPrice, setCeilingPrice] = useState('');
  const [durationUnit, setDurationUnit] = useState('Days');
  const [coiAgreed, setCoiAgreed] = useState(false);
  const [nfaText, setNfaText] = useState('');

  const [workflows, setWorkflows] = useState<any[]>([]);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');

  useEffect(() => {
    fetch('/api/workflows').then(r => r.json()).then(data => { if (Array.isArray(data)) setWorkflows(data); });
    fetch('/api/users').then(r => r.json()).then(data => { if (Array.isArray(data)) setSystemUsers(data); });
  }, []);
  
  const [isNfaModalOpen, setIsNfaModalOpen] = useState(false);
  const [tcText, setTcText] = useState('');
  const [isTcModalOpen, setIsTcModalOpen] = useState(false);

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbTemplates(data);
      })
      .catch(console.error);
      
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(console.error);
  }, []);

  const [vendorSearch, setVendorSearch] = useState('');
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [tempSelectedVendorIds, setTempSelectedVendorIds] = useState<Set<string>>(new Set());
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVendors(data);
      })
      .catch(console.error);

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(console.error);
  }, []);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || 
    v.email?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const handleSelectVendor = (vendor: any) => {
    if (!selectedVendors.find(v => v.id === vendor.id)) {
      setSelectedVendors([...selectedVendors, vendor]);
    }
    setVendorSearch('');
    setIsVendorDropdownOpen(false);
  };

  const handleRemoveVendor = (id: number) => {
    setSelectedVendors(selectedVendors.filter(v => v.id !== id));
  };

  const [eventMode, setEventMode] = useState('Live Event');

  useEffect(() => {
    if (searchParams.get('fromPR') === 'true') {
      const saved = localStorage.getItem('prToEventItems');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) {
            const newLineItems = parsed.map((prod: any, idx: number) => ({
              id: Date.now() + idx,
              evaluatorId: '',
              _source: `PR ${prod._source}`,
              values: {
                "Item Name": prod.name,
                "Product Code": prod.code,
                "Quantity": prod.qty?.toString(),
                "UOM": prod.uom || "EA",
                "Category": "IT/Hardware"
              }
            }));
            setLineItems(newLineItems);
            const eventTitle = parsed.length === 1 
              ? `Procurement of ${parsed[0].name}` 
              : `Event from PR: ${searchParams.get('prs')}`;
            setTitle(eventTitle);
            
            if (parsed[0] && parsed[0].name) {
              setCreatorData(prev => ({
                ...prev,
                'Product Name': parsed[0].name,
                'Product Code': parsed[0].code || '',
                'Category': 'IT/Hardware',
                'UOM': parsed[0].uom || 'EA',
                'Quantity': parsed[0].qty?.toString() || '1'
              }));
            }
            
            localStorage.removeItem('prToEventItems');
          }
        } catch(e) {}
      }
    }

    if (searchParams.get('fromCart') === 'true') {
      const cart = localStorage.getItem('rfqCart');
      if (cart) {
        try {
          const parsedCart = JSON.parse(cart);
          if (parsedCart.length > 0) {
            const newLineItems = parsedCart.map((prod: any, idx: number) => ({
              id: Date.now() + idx,
              evaluatorId: '',
              values: {
                "Item Name": prod.name,
                "Product Code": prod.code,
                "Quantity": "1",
                "UOM": prod.uom || "Unit",
                "Category": prod.category
              }
            }));
            setLineItems(newLineItems);
            setTitle("New Cart RFQ Event");
            localStorage.removeItem('rfqCart');
            window.dispatchEvent(new Event('cart_updated')); 
          }
        } catch(e) {}
      }
    }
  }, [searchParams]);

   
  useEffect(() => {
    if (dbTemplates.length > 0) {
      if (technicalTemplate !== 'Select Templates' && !selectedTechnicalTemplateObj) {
        setSelectedTechnicalTemplateObj(dbTemplates.find((t: any) => t.name === technicalTemplate));
      }
      if (rfqTemplate !== 'Select Templates' && !selectedRfqTemplateObj) {
        setSelectedRfqTemplateObj(dbTemplates.find((t: any) => t.name === rfqTemplate));
      }
      if (auctionTemplate !== 'Select Templates' && !selectedAuctionTemplateObj) {
        setSelectedAuctionTemplateObj(dbTemplates.find((t: any) => t.name === auctionTemplate));
      }
    }
  }, [dbTemplates, technicalTemplate, selectedTechnicalTemplateObj, rfqTemplate, selectedRfqTemplateObj, auctionTemplate, selectedAuctionTemplateObj]);

  const glassInputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', background: 'rgba(255, 255, 255, 0.9)', outline: 'none', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' };
  
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', margin: '-32px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Workspace Sidebar */}
      {isWorkspaceMode && (
        <div style={{ width: '380px', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.6)', padding: '24px', overflowY: 'auto', boxShadow: '4px 0 24px rgba(0,0,0,0.02)', zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <LayoutTemplate size={20} color="#0f172a" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>Intake Workspace</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>Drag an intake and drop it into the Event Line Items table to auto-populate data.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {intakes.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px dashed rgba(203,213,225,0.8)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No intakes available.</div>
              </div>
            )}
            {intakes.map((intake: any) => (
              <div 
                key={intake.refId} 
                draggable 
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', intake.refId);
                  e.currentTarget.style.opacity = '0.5';
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'none';
                }}
                style={{ background: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '12px', padding: '16px', cursor: 'grab', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'all 0.2s ease', position: 'relative' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ position: 'absolute', right: '16px', top: '16px', color: '#cbd5e1' }}><GripVertical size={16} /></div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#3b82f6', marginBottom: '4px', letterSpacing: '0.5px' }}>{intake.refId}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1e293b', marginBottom: '12px', paddingRight: '20px' }}>{intake.title}</div>
                <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontWeight: '500' }}>{intake.type}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: intake.status === 'Approved' ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                    {intake.status === 'Approved' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {intake.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Sticky Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.6)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <input 
              type="text" 
              placeholder="Enter Event Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', flex: 1, background: 'transparent' }}
            />
            
            
          </div>

          
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.8)', padding: '6px', borderRadius: '30px', gap: '4px', border: '1px solid rgba(226,232,240,0.8)' }}>
            <button 
              onClick={() => setIsWorkspaceMode(!isWorkspaceMode)}
              style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '24px', cursor: 'pointer', border: 'none', background: isWorkspaceMode ? '#e0f2fe' : 'transparent', color: isWorkspaceMode ? '#0369a1' : '#64748b', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutTemplate size={16} /> {isWorkspaceMode ? 'Hide Workspace' : 'Workspace'}
            </button>
            
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          
          {/* Card 1: Setup */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 1px 3px -1px rgba(0,0,0,0.02)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={20} color="#3b82f6" /> Event Setup</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              
              {/* Event Type */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Evaluation Type</label>
                <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setIsEventTypeOpen(!isEventTypeOpen)}
                  style={{ ...glassInputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '500' }}>
                    {eventType === 'Japanese Reverse Auction' ? 'Japanese Reverse Auction (The "Survival" Drop)' : eventType}
                  </span>
                  <ChevronDown size={16} color="#94a3b8" />
                </div>
                {isEventTypeOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 20, overflow: 'hidden' }}>
                    <div onClick={() => { setEventType('Rank based'); setIsEventTypeOpen(false); }} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: '#333' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}> Rank based</div>
                    <div onClick={() => { setEventType('Japanese Reverse Auction'); setIsEventTypeOpen(false); }} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: '#333', borderTop: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}> Japanese Reverse Auction (The "Survival" Drop)</div>
                      <div onClick={() => { setEventType('Price based'); setIsEventTypeOpen(false); }} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: '#333', borderTop: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}> Price based</div>
                  </div>
                  )}
                </div>
              </div>

                {eventType === 'Japanese Reverse Auction' && (
                  <div style={{ gridColumn: '1 / -1', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', marginTop: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Start Price (Max)</label>
                      <input type="number" value={japStartPrice} onChange={e => setJapStartPrice(e.target.value)} placeholder="e.g. 10000" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Drop Amount (Step)</label>
                      <input type="number" value={japDropAmount} onChange={e => setJapDropAmount(e.target.value)} placeholder="e.g. 200" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Time Interval (mins)</label>
                      <input type="number" value={japTickInterval} onChange={e => setJapTickInterval(e.target.value)} placeholder="e.g. 5" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }} />
                    </div>
                  </div>
                )}
              
              {/* Multi-Stage Configuration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Configure Event Stages</h4>
                
                {/* Technical Stage */}
                {(!fromPR || techParam) && (
                  <div style={{ paddingBottom: '16px', borderBottom: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <input type="checkbox" checked={enableTechnical} disabled={fromPR} onChange={e => setEnableTechnical(e.target.checked)} style={{ width: '18px', height: '18px', cursor: fromPR ? 'not-allowed' : 'pointer' }} />
                      <span style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>Technical Validation</span>
                    </div>
                    {enableTechnical && (
                      <div style={{ position: 'relative', paddingLeft: '30px' }}>
                        <div onClick={() => setIsTechnicalTemplateOpen(!isTechnicalTemplateOpen)} style={{ ...glassInputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: '#fff' }}>
                          <span style={{ color: technicalTemplate === 'Select Templates' ? '#94a3b8' : '#0f172a', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><LayoutTemplate size={16} /> {technicalTemplate}</span>
                          <ChevronDown size={16} color="#94a3b8" />
                        </div>
                        {isTechnicalTemplateOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: '30px', right: 0, marginTop: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 20, maxHeight: '200px', overflowY: 'auto' }}>
                            {dbTemplates.filter((t: any) => t.type === 'Technical').map((t: any) => (
                              <div key={t.id} onClick={() => { setTechnicalTemplate(t.name); setSelectedTechnicalTemplateObj(t); setIsTechnicalTemplateOpen(false); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>{t.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* RFQ Stage */}
                {(!fromPR || rfqParam) && (
                  <div style={{ paddingBottom: '16px', borderBottom: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <input type="checkbox" checked={enableRFQ} disabled={fromPR} onChange={e => setEnableRFQ(e.target.checked)} style={{ width: '18px', height: '18px', cursor: fromPR ? 'not-allowed' : 'pointer' }} />
                      <span style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>RFQ (Commercial)</span>
                    </div>
                    {enableRFQ && (
                      <div style={{ position: 'relative', paddingLeft: '30px' }}>
                        <div onClick={() => setIsRfqTemplateOpen(!isRfqTemplateOpen)} style={{ ...glassInputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: '#fff' }}>
                          <span style={{ color: rfqTemplate === 'Select Templates' ? '#94a3b8' : '#0f172a', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><LayoutTemplate size={16} /> {rfqTemplate}</span>
                          <ChevronDown size={16} color="#94a3b8" />
                        </div>
                        {isRfqTemplateOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: '30px', right: 0, marginTop: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 20, maxHeight: '200px', overflowY: 'auto' }}>
                            {dbTemplates.filter((t: any) => !t.type || t.type === 'RFQ').map((t: any) => (
                              <div key={t.id} onClick={() => { setRfqTemplate(t.name); setSelectedRfqTemplateObj(t); setIsRfqTemplateOpen(false); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>{t.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Auction Stage */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <input type="checkbox" checked={enableAuction} onChange={e => setEnableAuction(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>Reverse Auction</span>
                  </div>
                  {enableAuction && (
                    <div style={{ position: 'relative', paddingLeft: '30px' }}>
                      <div onClick={() => setIsAuctionTemplateOpen(!isAuctionTemplateOpen)} style={{ ...glassInputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: '#fff' }}>
                        <span style={{ color: auctionTemplate === 'Select Templates' ? '#94a3b8' : '#0f172a', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><LayoutTemplate size={16} /> {auctionTemplate}</span>
                        <ChevronDown size={16} color="#94a3b8" />
                      </div>
                      {isAuctionTemplateOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: '30px', right: 0, marginTop: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 20, maxHeight: '200px', overflowY: 'auto' }}>
                          {dbTemplates.filter((t: any) => t.type === 'Auction').map((t: any) => (
                            <div key={t.id} onClick={() => { setAuctionTemplate(t.name); setSelectedAuctionTemplateObj(t); setIsAuctionTemplateOpen(false); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>{t.name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Event Duration</label>
                <div style={{ display: 'flex', alignItems: 'center', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
                  <input 
                    type="number" min="0" value={durationValue} onChange={e => setDurationValue(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    placeholder=""
                    style={{ width: '80px', padding: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', borderRight: 'none', borderRadius: '12px 0 0 12px', background: 'rgba(255,255,255,0.9)', outline: 'none', fontSize: '0.95rem', fontWeight: '500', color: '#0f172a' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)'}
                  />
                  <select
                    value={durationUnit}
                    onChange={e => setDurationUnit(e.target.value)}
                    style={{ flex: 1, padding: '12px 24px 12px 16px', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '0 12px 12px 0', background: 'rgba(248, 250, 252, 0.9)', outline: 'none', fontSize: '0.95rem', fontWeight: '500', color: '#0f172a', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '10px' }}
                  >
                    <option value="Minutes">Minutes</option>
                    <option value="Hours">Hours</option>
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Dynamic Template Fields */}
            {(selectedTechnicalTemplateObj || selectedRfqTemplateObj || selectedAuctionTemplateObj) && (
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Template Configuration</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Min Bid Step (Optional)</label>
                    <input 
                      type="number" min="0" value={minBidStep} onChange={e => setMinBidStep(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      placeholder="e.g. 50"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', background: 'rgba(255, 255, 255, 0.9)', outline: 'none', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Max Allowed Price / Ceiling (Optional)</label>
                    <input 
                      type="number" min="0" value={ceilingPrice} onChange={e => setCeilingPrice(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      placeholder="e.g. 10000"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', background: 'rgba(255, 255, 255, 0.9)', outline: 'none', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                    />
                  </div>
                </div>
                {(() => {
                  try {
                    let fields: any[] = [];
                    if (selectedTechnicalTemplateObj) fields = [...fields, ...JSON.parse(selectedTechnicalTemplateObj.fields)];
                    if (selectedRfqTemplateObj) fields = [...fields, ...JSON.parse(selectedRfqTemplateObj.fields)];
                    if (selectedAuctionTemplateObj) fields = [...fields, ...JSON.parse(selectedAuctionTemplateObj.fields)];
                    
                    const mFields = getMultipliedFields(fields, lineItems, fromPR);
                    const creatorFields = mFields.filter((f: any) => f.role === 'Creator');
                    // Remove duplicates based on key
                    const uniqueCreatorFields = Array.from(new Map(creatorFields.map(f => [f.key, f])).values());
                    
                    if (uniqueCreatorFields.length === 0) return <div style={{ fontSize: '0.9rem', color: '#64748b' }}>No buyer-filled requirements.</div>;
                    
                    const groupedFields = new Map<any, any[]>();
                    uniqueCreatorFields.forEach((f: any) => {
                        const g = f._sourceItemId || 'default';
                        if (!groupedFields.has(g)) groupedFields.set(g, []);
                        groupedFields.get(g)!.push(f);
                    });

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {Array.from(groupedFields.entries()).map(([groupId, groupFields]: any, gIdx: number) => {
                          const item = lineItems.find(i => i.id === groupId);
                          const groupName = item ? (item.values['Item Name'] || `Item ${gIdx + 1}`) : 'General Requirements';
                          const isMulti = groupedFields.size > 1 || fromPR;
                          
                          return (
                            <div key={groupId} style={{ backgroundColor: isMulti ? '#f8fafc' : 'transparent', padding: isMulti ? '20px' : '0', borderRadius: '8px', border: isMulti ? '1px solid #e2e8f0' : 'none' }}>
                              {isMulti && (
                                <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #cbd5e1', color: '#1e293b', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '6px', height: '18px', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
                                  {groupName}
                                </div>
                              )}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {groupFields.map((f: any) => (
                                  <div key={f.key}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>
                                      {isMulti ? (f.originalName || f.name.replace(groupName + ' - ', '')) : f.name}
                                    </label>
                                    {f.type === 'product' ? (
                                      <React.Fragment>
                                        <input
                                          type="text"
                                          list={!fromPR ? `products-list-${f.key}` : undefined}
                                          readOnly={fromPR}
                                          placeholder={fromPR ? "Auto-filled from PR" : "Type to search products..."}
                                          value={creatorData[f.key] || ''}
                                          onChange={(e) => {
                                            const selectedName = e.target.value;
                                            const prod = products.find(p => p.name === selectedName);
                                            
                                            if (prod) {
                                              const newData: Record<string, string> = { ...creatorData, [f.key]: selectedName };
                                              uniqueCreatorFields.forEach((otherField: any) => {
                                                if (otherField.key === f.key || otherField._sourceItemId !== f._sourceItemId) return;
                                                const n = (otherField.originalKey || otherField.name).toLowerCase();
                                                if (n.includes('uom') || n.includes('unit')) { 
                                                  newData[otherField.key as string] = prod.uom || '';
                                                } else if (n.includes('category')) { 
                                                  newData[otherField.key as string] = prod.category || '';
                                                } else if (n.includes('desc')) { 
                                                  newData[otherField.key as string] = prod.description || '';
                                                } else if (n.includes('code')) { 
                                                  newData[otherField.key as string] = prod.code || '';
                                                }
                                              });
                                              setCreatorData(newData);
                                            } else {
                                              setCreatorData({ ...creatorData, [f.key]: selectedName });
                                            }
                                          }}
                                          style={fromPR ? { ...glassInputStyle, background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : glassInputStyle}
                                          onFocus={e => !fromPR && (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)')}
                                          onBlur={e => !fromPR && (e.currentTarget.style.boxShadow = 'none')}
                                        />
                                        <datalist id={`products-list-${f.key}`}>
                                          {products.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                          ))}
                                        </datalist>
                                      </React.Fragment>
                                    ) : f.type === 'location' ? (
                                      <LocationAutocomplete
                                        value={creatorData[f.key] || ''}
                                        onChange={(val) => setCreatorData({ ...creatorData, [f.key]: val })}
                                        placeholder={`Search for ${f.name}`}
                                        style={glassInputStyle}
                                      />
                                    ) : f.type === 'date' ? (
                                      <input 
                                        type="date" value={creatorData[f.key] || ''} onChange={(e) => setCreatorData({ ...creatorData, [f.key]: e.target.value })}
                                        style={glassInputStyle} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)'} onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                                      />
                                    ) : (
                                      <input 
                                        type="text" placeholder={`Enter ${f.name}`} value={creatorData[f.key] || ''} onChange={(e) => setCreatorData({ ...creatorData, [f.key]: e.target.value })}
                                        style={glassInputStyle} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)'} onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  } catch(e) { return null; }
                })()}
              </div>
            )}
          </div>


          
          {/* Card 3: Participants */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 1px 3px -1px rgba(0,0,0,0.02)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Users size={20} color="#8b5cf6" /> Participants</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {showTinderMatchmaking && (
                  <button 
                    onClick={() => setIsTinderModalOpen(true)}
                    style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#fff', border: 'none', borderRadius: '24px', padding: '8px 16px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px rgba(236, 72, 153, 0.3)', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                     Smart Match AI
                  </button>
                )}
                <button 
                  onClick={() => {
                    setTempSelectedVendorIds(new Set(selectedVendors.map(v => v.id)));
                    setIsVendorModalOpen(true);
                  }}
                  style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '24px', padding: '8px 16px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)' }}
                >
                  <Plus size={16} /> Add Participant
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedVendors.length > 0 ? (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {selectedVendors.map(vendor => (
                    <div key={vendor.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(to right, #f3e8ff, #e0e7ff)', color: '#4338ca', padding: '8px 16px', borderRadius: '24px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #c7d2fe', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', animation: 'fadeIn 0.3s ease' }}>
                      <ShieldCheck size={16} /> {vendor.name}
                      <button onClick={() => handleRemoveVendor(vendor.id)} style={{ background: 'rgba(255,255,255,0.5)', border: 'none', color: '#4338ca', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '4px' }}>&times;</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '32px', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                  No participants added yet. Click "Add Participant" to invite vendors.
                </div>
              )}
            </div>
          </div>
          
          
{/* Legal & Approvals */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '32px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Legal & Approvals
              </h2>
            </div>
            
            <div style={{ padding: '24px', paddingBottom: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Workflow Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Approval Workflow Name (Optional)</label>
                <select 
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">-- Auto-assign based on Category --</option>
                  {workflows.map(wf => (
                    <option key={wf.id} value={wf.id}>{wf.name}</option>
                  ))}
                </select>
                
                {/* Visual Workflow Path */}
                {selectedWorkflowId && (
                  <div style={{ marginTop: '16px', padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px dashed #bfdbfe' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approval Path</h4>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      {(() => {
                        const selectedWf = workflows.find(w => w.id === selectedWorkflowId);
                        if (!selectedWf) return null;
                        let approverIds = [];
                        try { approverIds = JSON.parse(selectedWf.approvers || '[]'); } catch(e){}
                        if (approverIds.length === 0) return <span style={{ color: '#64748b', fontSize: '0.9rem' }}>No approvers defined.</span>;
                        
                        return approverIds.map((userId, index) => {
                          const userObj = systemUsers.find(u => u.id === userId);
                          const userName = userObj ? userObj.name : 'Unknown User';
                          return (
                            <React.Fragment key={index}>
                              <div style={{ background: '#fff', border: '1px solid #93c5fd', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <span style={{ background: '#dbeafe', color: '#1e3a8a', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.75rem' }}>{index + 1}</span>
                                {userName}
                              </div>
                              {index < approverIds.length - 1 && (
                                <div style={{ color: '#94a3b8', fontWeight: 'bold' }}>➔</div>
                              )}
                            </React.Fragment>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }}>
                <button 
                  onClick={() => setIsNfaModalOpen(true)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '6px', border: nfaText ? '1px solid #10b981' : '1px dashed #cbd5e1', background: nfaText ? '#ecfdf5' : '#f8fafc', color: nfaText ? '#059669' : '#334155', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                >
                  {nfaText ? '✓ NFA Added (Edit)' : '+ NFA (Mandatory)'}
                </button>
                <button 
                  onClick={() => setIsTcModalOpen(true)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '6px', border: tcText ? '1px solid #3b82f6' : '1px dashed #cbd5e1', background: tcText ? '#eff6ff' : '#f8fafc', color: tcText ? '#1d4ed8' : '#334155', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                >
                  {tcText ? '✓ T&C Added (Edit)' : '+ T&C (Optional)'}
                </button>
              </div>
              
              {/* Conflict of Interest Checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: coiAgreed ? '#eff6ff' : '#f8fafc', borderRadius: '12px', border: coiAgreed ? '2px solid #3b82f6' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
                <input type="checkbox" checked={coiAgreed} onChange={(e) => setCoiAgreed(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '500' }}>I declare that there is no Conflict of Interest (COI) in conducting this sourcing event.</span>
              </label>
              <div style={{ height: '16px', width: '100%' }}></div>
              
            </div>
          </div>
          
          {/* NFA Modal */}
          {isNfaModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#fff', borderRadius: '16px', width: '600px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Note For Approval (NFA)</h3>
                  <button onClick={() => setIsNfaModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.5rem' }}>&times;</button>
                </div>
                <div style={{ padding: '24px' }}>
                  <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.9rem' }}>Please provide the justification, budget codes, and approval notes for this event. This is required.</p>
                  <textarea 
                    value={nfaText} 
                    onChange={e => setNfaText(e.target.value)} 
                    rows={8} 
                    placeholder="Enter NFA details here..."
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', color: '#334155', resize: 'vertical' }}
                  />
                </div>
                <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button onClick={() => setIsNfaModalOpen(false)} style={{ padding: '10px 24px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setIsNfaModalOpen(false)} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save NFA</button>
                </div>
              </div>
            </div>
          )}

          {/* T&C Modal */}
          {isTcModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#fff', borderRadius: '16px', width: '600px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Terms & Conditions</h3>
                  <button onClick={() => setIsTcModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.5rem' }}>&times;</button>
                </div>
                <div style={{ padding: '24px' }}>
                  <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.9rem' }}>Specify any specific terms, conditions, or SLA requirements for this event. This is optional.</p>
                  <textarea 
                    value={tcText} 
                    onChange={e => setTcText(e.target.value)} 
                    rows={8} 
                    placeholder="Enter Terms & Conditions..."
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', color: '#334155', resize: 'vertical' }}
                  />
                </div>
                <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button onClick={() => setIsTcModalOpen(false)} style={{ padding: '10px 24px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setIsTcModalOpen(false)} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save T&C</button>
                </div>
              </div>
            </div>
          )}


          <div style={{ height: '180px' }}></div> {/* Huge Spacer for Footer */}
          
</div>
          {/* Sticky Glass Footer - Launch Actions */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(226, 232, 240, 0.8)', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.05)', zIndex: 50 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timeline Status</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>Event is ready to launch</div>
          </div>
          <button 
            onClick={async () => {
              const isValidDuration = durationValue && parseInt(durationValue) > 0;
              const isValidJap = eventType !== 'Japanese Reverse Auction' || (japStartPrice && japDropAmount && japTickInterval);
                const isValidNfa = nfaText && nfaText.trim().length > 0;
                if (title && selectedVendors.length > 0 && (enableTechnical || enableRFQ || enableAuction) && (!enableTechnical || technicalTemplate !== 'Select Templates') && (!enableRFQ || rfqTemplate !== 'Select Templates') && (!enableAuction || auctionTemplate !== 'Select Templates') && isValidDuration && isValidJap && isValidNfa && coiAgreed) {
                try {
                  // Calculate endTime if duration is provided
                  let calculatedEndTime = null;
                  if (durationValue) {
                    const num = parseInt(durationValue);
                    if (!isNaN(num) && num > 0) {
                      let ms = 0;
                      if (durationUnit === 'Minutes') ms = num * 60 * 1000;
                      else if (durationUnit === 'Hours') ms = num * 60 * 60 * 1000;
                      else if (durationUnit === 'Days') ms = num * 24 * 60 * 60 * 1000;
                      else if (durationUnit === 'Months') ms = num * 30 * 24 * 60 * 60 * 1000;
                      calculatedEndTime = new Date(Date.now() + ms).toISOString();
                    }
                  }

                  const finalStages = [];
                  if (enableTechnical) {
                    finalStages.push({
                      type: 'Technical',
                      name: technicalTemplate,
                      mode: 'Technical Validation',
                      templateFields: selectedTechnicalTemplateObj ? getMultipliedFields(JSON.parse(selectedTechnicalTemplateObj.fields), lineItems, fromPR).map((f: any) => ({
                        ...f, defaultValue: f.role === 'Creator' ? (creatorData[f.key] || 0) : undefined
                      })) : []
                    });
                  }
                  if (enableRFQ) {
                    finalStages.push({
                      type: 'RFQ',
                      name: rfqTemplate,
                      mode: eventMode,
                      minBidStep: Number(minBidStep) || 0, ceilingPrice: Number(ceilingPrice) || 0, templateFields: selectedRfqTemplateObj ? getMultipliedFields(JSON.parse(selectedRfqTemplateObj.fields), lineItems, fromPR).map((f: any) => ({
                        ...f, defaultValue: f.role === 'Creator' ? (creatorData[f.key] || 0) : undefined
                      })) : []
                    });
                  }
                  if (enableAuction) {
                    finalStages.push({
                      type: 'Auction',
                      name: auctionTemplate,
                      mode: 'Live Auction',
                      minBidStep: Number(minBidStep) || 0, ceilingPrice: Number(ceilingPrice) || 0, templateFields: selectedAuctionTemplateObj ? getMultipliedFields(JSON.parse(selectedAuctionTemplateObj.fields), lineItems, fromPR).map((f: any) => ({
                        ...f, defaultValue: f.role === 'Creator' ? (creatorData[f.key] || 0) : undefined
                      })) : []
                    });
                  }

                  const res = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      workflowId: selectedWorkflowId || undefined,
                      title,
                      type: 'Single-Stage',
                      account: 'Acme Corp',
                      baseCurrency: baseCurrency,
                      feedbackMode: feedbackMode,
                      endTime: calculatedEndTime,
                      stages: finalStages,
                      participants: selectedVendors,
                      sourcePrs: searchParams.get('prs') || null
                    })
                  });
                  if (res.ok) {
                    alert("Event successfully created and published to Vendor Portal!");
                    router.push('/client/events');
                  } else { alert("Error creating event"); }
                } catch (err) { alert("Network error"); }
              } else {
                const missing = [];
                if (!title) missing.push("Title");
                if (selectedVendors.length === 0) missing.push("at least one Vendor");
                if (enableTechnical && technicalTemplate === 'Select Templates') missing.push("a Technical Template");
                if (enableRFQ && rfqTemplate === 'Select Templates') missing.push("an RFQ Template");
                if (enableAuction && auctionTemplate === 'Select Templates') missing.push("an Auction Template");
                if (!enableTechnical && !enableRFQ && !enableAuction) missing.push("at least one stage enabled");
                  if (!durationValue || parseInt(durationValue) <= 0) missing.push("Event Duration");
                  if (!nfaText || !nfaText.trim()) missing.push("NFA Details");
                  if (!coiAgreed) missing.push("Conflict of Interest Declaration");
                alert(`Please provide: ${missing.join(', ')}`);
              }
            }}
            style={{ 
              background: (title && selectedVendors.length > 0 && (enableTechnical || enableRFQ || enableAuction) && (!enableTechnical || technicalTemplate !== 'Select Templates') && (!enableRFQ || rfqTemplate !== 'Select Templates') && (!enableAuction || auctionTemplate !== 'Select Templates') && durationValue && parseInt(durationValue) > 0 && (eventType !== 'Japanese Reverse Auction' || (japStartPrice && japDropAmount && japTickInterval)) && nfaText && nfaText.trim().length > 0 && coiAgreed) ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#e2e8f0', 
              color: (title && selectedVendors.length > 0 && (enableTechnical || enableRFQ || enableAuction) && (!enableTechnical || technicalTemplate !== 'Select Templates') && (!enableRFQ || rfqTemplate !== 'Select Templates') && (!enableAuction || auctionTemplate !== 'Select Templates') && durationValue && parseInt(durationValue) > 0 && (eventType !== 'Japanese Reverse Auction' || (japStartPrice && japDropAmount && japTickInterval)) && nfaText && nfaText.trim().length > 0 && coiAgreed) ? '#ffffff' : '#94a3b8', 
              border: 'none', borderRadius: '30px', 
              padding: '16px 32px', fontWeight: '600', fontSize: '1.05rem', 
              cursor: (title && selectedVendors.length > 0 && (enableTechnical || enableRFQ || enableAuction) && (!enableTechnical || technicalTemplate !== 'Select Templates') && (!enableRFQ || rfqTemplate !== 'Select Templates') && (!enableAuction || auctionTemplate !== 'Select Templates')) ? 'pointer' : 'not-allowed',
              boxShadow: (title && selectedVendors.length > 0 && (enableTechnical || enableRFQ || enableAuction) && (!enableTechnical || technicalTemplate !== 'Select Templates') && (!enableRFQ || rfqTemplate !== 'Select Templates') && (!enableAuction || auctionTemplate !== 'Select Templates')) ? '0 10px 15px -3px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
            onMouseEnter={e => { if (title && selectedVendors.length > 0 && (enableTechnical || enableRFQ || enableAuction) && (!enableTechnical || technicalTemplate !== 'Select Templates') && (!enableRFQ || rfqTemplate !== 'Select Templates') && (!enableAuction || auctionTemplate !== 'Select Templates')) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { if (title && selectedVendors.length > 0 && (enableTechnical || enableRFQ || enableAuction) && (!enableTechnical || technicalTemplate !== 'Select Templates') && (!enableRFQ || rfqTemplate !== 'Select Templates') && (!enableAuction || auctionTemplate !== 'Select Templates')) e.currentTarget.style.transform = 'none' }}
          >
            Launch Event 
          </button>
        </div>

      </div>

      {/* Tinder Smart Matchmaking Modal */}
      
      {/* Vendor Selection Modal */}
      {isVendorModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '600px', maxWidth: '90%', maxHeight: '80vh', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'modalSlideUp 0.3s ease-out forwards' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>Select Participants</h2>
              <button onClick={() => setIsVendorModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={18} /></div>
                <input 
                  type="text" 
                  placeholder="Search vendors by name or email..." 
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1px solid #cbd5e1', borderRadius: '12px', outline: 'none', fontSize: '0.95rem', color: '#0f172a' }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px' }}>
              {filteredVendors.length > 0 ? (
                filteredVendors.map(vendor => {
                  const isSelected = selectedVendors.some(v => v.id === vendor.id);
                  return (
                    <label key={vendor.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedVendors(selectedVendors.filter(v => v.id !== vendor.id));
                          } else {
                            setSelectedVendors([...selectedVendors, vendor]);
                          }
                        }}
                        style={{ width: '20px', height: '20px', accentColor: '#3b82f6', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '1rem' }}>{vendor.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>{vendor.email} &bull; {vendor.type || 'Vendor'}</div>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>No vendors found matching "{vendorSearch}"</div>
              )}
            </div>
            
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>{selectedVendors.length} selected</span>
              <button onClick={() => setIsVendorModalOpen(false)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.3)' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {isTinderModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '450px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button onClick={() => setIsTinderModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
              <X size={20} color="#0f172a" />
            </button>
            
            <div style={{ padding: '24px', background: 'linear-gradient(to right, #fdf2f8, #fce7f3)', borderBottom: '1px solid #fbcfe8', textAlign: 'center' }}>
              <h2 style={{ margin: 0, color: '#be185d', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 Smart Match AI
              </h2>
              <p style={{ margin: '8px 0 0 0', color: '#db2777', fontSize: '0.9rem' }}>Algorithmic curation of the top perfect suppliers.</p>
            </div>

            <div style={{ padding: '32px 24px', background: '#f8fafc', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {(() => {
                const availableVendors = vendors.filter(v => !selectedVendors.find(sv => sv.id === v.id));
                if (availableVendors.length === 0 || currentMatchIndex >= availableVendors.length) {
                  return (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '16px' }}></div>
                      <h3 style={{ color: '#0f172a', margin: '0 0 8px 0' }}>No more matches!</h3>
                      <p style={{ color: '#64748b', margin: 0 }}>You've reviewed all algorithmic recommendations.</p>
                      <button onClick={() => setIsTinderModalOpen(false)} style={{ marginTop: '24px', padding: '10px 24px', background: '#ec4899', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>Return to Event</button>
                    </div>
                  );
                }

                const cv = availableVendors[currentMatchIndex];
                return (
                  <div style={{ width: '100%', background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 16px auto' }}>
                      {cv.name.charAt(0)}
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>{cv.name}</h3>
                    <p style={{ color: '#64748b', margin: '0 0 16px 0', fontSize: '0.95rem' }}>{cv.city || 'Global Supplier'} • {cv.type || 'Manufacturer'}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{cv.trustScore || '4.8'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Trust Score</div>
                      </div>
                      <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>98%</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Match Rate</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                      <button 
                        onClick={() => setCurrentMatchIndex(currentMatchIndex + 1)}
                        style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', border: '2px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(239,68,68,0.2)', transition: 'transform 0.1s' }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <X size={32} />
                      </button>
                      <button 
                        onClick={() => {
                          handleSelectVendor(cv);
                          setCurrentMatchIndex(currentMatchIndex + 1);
                        }}
                        style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', border: '2px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16,185,129,0.2)', transition: 'transform 0.1s' }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <CheckCircle2 size={32} />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SingleStageCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SingleStageCreateContent />
    </Suspense>
  );
}
