'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useIntake } from '../../../context/IntakeContext';

export default function PRPage() {
  const { intakes } = useIntake();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectType, setProjectType] = useState('new'); // 'new' or 'draft'
  
  // Modal Checkbox States
  const [techStage, setTechStage] = useState(false);
  const [rfq, setRfq] = useState(false);
  const [auction, setAuction] = useState(false);

  const handleSelectRow = (refId: string) => {
    if (selectedRows.includes(refId)) {
      setSelectedRows(selectedRows.filter(id => id !== refId));
    } else {
      setSelectedRows([...selectedRows, refId]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(intakes.map(i => i.refId));
    } else {
      setSelectedRows([]);
    }
  };

  // Logic: Auction is mutually exclusive with Tech Stage and RFQ
  const handleTechToggle = () => {
    if (!techStage) { setAuction(false); }
    setTechStage(!techStage);
  };

  const handleRfqToggle = () => {
    if (!rfq) { setAuction(false); }
    setRfq(!rfq);
  };

  const handleAuctionToggle = () => {
    if (!auction) { 
      setTechStage(false); 
      setRfq(false); 
    }
    setAuction(!auction);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', minHeight: '100%', position: 'relative' }}>
      {/* Top Tabs Mockup */}
      <div style={{ display: 'flex', gap: '24px', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', fontSize: '0.9rem', fontWeight: '500' }}>
        <div style={{ color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '8px' }}>Open <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '4px' }}>{intakes.length}</span></div>
        <div style={{ color: '#6b7280' }}>In Progress <span style={{ backgroundColor: '#9ca3af', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '4px' }}>0</span></div>
        <div style={{ color: '#6b7280' }}>Completed <span style={{ backgroundColor: '#9ca3af', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '4px' }}>0</span></div>
        <div style={{ color: '#6b7280' }}>Hold <span style={{ backgroundColor: '#9ca3af', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '4px' }}>0</span></div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#6b7280', cursor: 'pointer' }}>≡</button>
           <button style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#2563eb', cursor: 'pointer' }}>👁</button>
           <button style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#6b7280', cursor: 'pointer' }}>🗂</button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📥
          </button>
          <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Actions ˅
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={selectedRows.length === 0}
            style={{ 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px', 
              backgroundColor: selectedRows.length > 0 ? '#10b981' : '#f3f4f6', 
              color: selectedRows.length > 0 ? '#fff' : '#9ca3af', 
              cursor: selectedRows.length > 0 ? 'pointer' : 'not-allowed', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontWeight: '500' 
            }}
          >
            🛒 Purchase Items {selectedRows.length > 0 ? `(${selectedRows.length})` : ''}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 24px', width: '50px' }}>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={selectedRows.length === intakes.length && intakes.length > 0} 
                />
              </th>
              <th style={{ padding: '12px', fontWeight: '600', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>PR NO (Ref ID)</th>
              <th style={{ padding: '12px', fontWeight: '600', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>Title / Material</th>
              <th style={{ padding: '12px', fontWeight: '600', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>Requester</th>
              <th style={{ padding: '12px', fontWeight: '600', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>FUND CENTER</th>
              <th style={{ padding: '12px', fontWeight: '600', color: '#4b5563' }}>Storage Location</th>
            </tr>
          </thead>
          <tbody>
            {intakes.length > 0 ? (
              intakes.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: selectedRows.includes(row.refId) ? '#eff6ff' : '#fff' }}>
                  <td style={{ padding: '12px 24px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRows.includes(row.refId)}
                      onChange={() => handleSelectRow(row.refId)}
                    />
                  </td>
                  <td style={{ padding: '12px', color: '#3b82f6', borderRight: '1px solid #e5e7eb' }}><Link href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>{row.refId}</Link></td>
                  <td style={{ padding: '12px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{row.title}</td>
                  <td style={{ padding: '12px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{row.reqName}</td>
                  <td style={{ padding: '12px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{Math.floor(Math.random() * 900000) + 100000}</td>
                  <td style={{ padding: '12px', color: '#4b5563' }}>{['HRSP', 'EDSP', 'ESSP'][Math.floor(Math.random() * 3)]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No PRs available. Create an Intake first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Purchase Items Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.25rem', color: '#111827' }}>Create Project from PRs</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.9rem' }}>1. Select Action</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="projectType" checked={projectType === 'new'} onChange={() => setProjectType('new')} />
                  Start New Project
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="projectType" checked={projectType === 'draft'} onChange={() => setProjectType('draft')} />
                  Add as Draft Project
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.9rem' }}>2. Select Stages</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: auction ? 'not-allowed' : 'pointer', color: auction ? '#9ca3af' : '#374151' }}>
                  <input type="checkbox" checked={techStage} onChange={handleTechToggle} disabled={auction} />
                  Technical Stage
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: auction ? 'not-allowed' : 'pointer', color: auction ? '#9ca3af' : '#374151' }}>
                  <input type="checkbox" checked={rfq} onChange={handleRfqToggle} disabled={auction} />
                  RFQ (Request for Quotation)
                </label>
                
                <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' }}></div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: (techStage || rfq) ? 'not-allowed' : 'pointer', color: (techStage || rfq) ? '#9ca3af' : '#374151' }}>
                  <input type="checkbox" checked={auction} onChange={handleAuctionToggle} disabled={techStage || rfq} />
                  Auction
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' }}>(Mutually exclusive)</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  
                  // Generate URL with selected PRs
                  const prs = selectedRows.join(',');
                  let destination = '';
                  
                  if (auction) {
                    destination = `/client/events/create/auction?prs=${prs}`;
                  } else {
                    destination = `/client/events/create/single-stage?prs=${prs}`;
                  }
                  
                  setSelectedRows([]);
                  window.location.href = destination;
                }}
                disabled={!techStage && !rfq && !auction}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: '4px', 
                  backgroundColor: (!techStage && !rfq && !auction) ? '#9ca3af' : '#2563eb', 
                  color: '#fff', cursor: (!techStage && !rfq && !auction) ? 'not-allowed' : 'pointer' 
                }}
              >
                Confirm Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
