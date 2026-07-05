'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ProjectSetupPage() {
  const [activeTab, setActiveTab] = useState('technical');

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', minHeight: '100%', paddingBottom: '40px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>Title: <span style={{ color: '#374151', fontWeight: '600' }}>10152-APD FABRICATION</span></h1>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '0.85rem' }}>
            📎 Add Attachments
          </button>
          <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '0.85rem' }}>
            📄 Add T&Cs
          </button>
          <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '0.85rem' }}>
            ☰ Items <span style={{ backgroundColor: '#2563eb', color: '#fff', padding: '2px 6px', borderRadius: '12px', fontSize: '0.7rem' }}>1</span>
          </button>
          <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '0.85rem' }}>
            💾 Save as draft
          </button>
          <button style={{ padding: '8px 24px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Publish
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', alignItems: 'center' }}>
        <div 
          onClick={() => setActiveTab('technical')}
          style={{ 
            padding: '16px 20px', 
            borderBottom: activeTab === 'technical' ? '2px solid #2563eb' : '2px solid transparent', 
            color: activeTab === 'technical' ? '#2563eb' : '#6b7280', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'technical' ? '600' : '400',
            backgroundColor: activeTab === 'technical' ? '#fff' : 'transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          Technical Stage <span style={{ color: '#9ca3af' }}>⋮</span>
        </div>
        <div 
          onClick={() => setActiveTab('rfq')}
          style={{ 
            padding: '16px 20px', 
            borderBottom: activeTab === 'rfq' ? '2px solid #2563eb' : '2px solid transparent', 
            color: activeTab === 'rfq' ? '#2563eb' : '#6b7280', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'rfq' ? '600' : '400',
            backgroundColor: activeTab === 'rfq' ? '#fff' : 'transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          RFQ <span style={{ color: '#9ca3af' }}>⋮</span>
        </div>
        <div style={{ padding: '16px 20px', color: '#6b7280', cursor: 'pointer', fontSize: '1.2rem' }}>
          +
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '24px', backgroundColor: '#f3f4f6', minHeight: '500px' }}>
        
        {/* Event Type & Template */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Event Type</div>
            <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#3b82f6' }}>📄</span> Technical Stage <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>&gt;</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Item Template</div>
            <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              ⊞ Select Templates <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>˅</span>
            </div>
          </div>
        </div>

        {/* Vendor Assessment Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Vendor Assessment</h2>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Template: ⊞ Select Template <span style={{ fontSize: '0.7rem' }}>˅</span>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb', width: '50px' }}>#</th>
                <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Specification<span style={{ color: '#ef4444' }}>*</span></th>
                <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Description<span style={{ color: '#ef4444' }}>*</span></th>
                <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280' }}>Vendor Response<span style={{ color: '#ef4444' }}>*</span></th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 24px', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>1</td>
                <td style={{ padding: '12px 24px', borderRight: '1px solid #e5e7eb' }}></td>
                <td style={{ padding: '12px 24px', borderRight: '1px solid #e5e7eb' }}></td>
                <td style={{ padding: '12px 24px' }}></td>
              </tr>
            </tbody>
          </table>
          <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb' }}>
            <div style={{ height: '4px', backgroundColor: '#d1d5db', borderRadius: '4px', width: '100%' }}></div>
          </div>
        </div>

        {/* Line Items Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Line Items</h2>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              By: <span style={{ color: '#3b82f6' }}>✎ Harit Mehta (Planner)</span>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <tbody>
              {/* Row 2 */}
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 24px', color: '#6b7280', width: '50px', verticalAlign: 'top' }}>2</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top', width: '25%' }}>NOMENCLATURE</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top', width: '40%' }}>GEARED SLEEVE</td>
                <td style={{ padding: '16px 24px', color: '#3b82f6', verticalAlign: 'top', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span>Long Text ✎</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                    Required
                    <div style={{ width: '32px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '16px', position: 'relative' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#ef4444', verticalAlign: 'top', textAlign: 'right' }}>🗑</td>
              </tr>
              
              {/* Row 3 */}
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 24px', color: '#6b7280', width: '50px', verticalAlign: 'top' }}>3</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top' }}>DRAWING NUMBER</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top' }}>3930942</td>
                <td style={{ padding: '16px 24px', color: '#3b82f6', verticalAlign: 'top', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span>Long Text ✎</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                    Required
                    <div style={{ width: '32px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '16px', position: 'relative' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#ef4444', verticalAlign: 'top', textAlign: 'right' }}>🗑</td>
              </tr>

              {/* Row 4 */}
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 24px', color: '#6b7280', width: '50px', verticalAlign: 'top' }}>4</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top' }}>MAJOR ASSEMBLY</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top' }}>COUPLING SE125</td>
                <td style={{ padding: '16px 24px', color: '#3b82f6', verticalAlign: 'top', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span>Long Text ✎</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                    Required
                    <div style={{ width: '32px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '16px', position: 'relative' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#ef4444', verticalAlign: 'top', textAlign: 'right' }}>🗑</td>
              </tr>

              {/* Row 5 */}
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 24px', color: '#6b7280', width: '50px', verticalAlign: 'top' }}>5</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top' }}>Item Text</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top', lineHeight: '1.5' }}>
                  ALL BELOW REPORTS REQUIRE FOR REVIEW BEFORE DISPATCH. AFTER REVIEW CLEARANCE WILL BE GIVEN OR INSPECTION TO BE DONE AT VENDOR'S WORKS.<br/><br/>
                  DIMENSIONAL REPORT + CHEMICAL ANALYSIS + MECHANICAL PROPERTIES (UTS, YS, EL, RA & NOTCH IMPACT ENERGY AS PER THE RESPECTIVE MATERIAL SPECIFICATION) + DP TEST REPORT + HARDNESS REPORT + UT REPORT<br/><br/>
                  NOTES :<br/>
                  (1) WE NEED MATERIAL EXACT AS PER DRG / BOM.<br/>
                  (2) No ALTERNATIVE MATERIAL WILL BE ACCEPTED.<br/>
                  (3) MATERIAL CODE AND PO NUMBER MUST MENTION IN ALL TEST REPORT.
                </td>
                <td style={{ padding: '16px 24px', color: '#3b82f6', verticalAlign: 'top', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span>Long Text ✎</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                    Required
                    <div style={{ width: '32px', height: '16px', backgroundColor: '#d1d5db', borderRadius: '16px', position: 'relative' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }}></div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#ef4444', verticalAlign: 'top', textAlign: 'right' }}>🗑</td>
              </tr>
              
              {/* Row 6 */}
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 24px', color: '#6b7280', width: '50px', verticalAlign: 'top' }}>6</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top' }}>Attach additional documents if any</td>
                <td style={{ padding: '16px 24px', color: '#4b5563', verticalAlign: 'top' }}>Attachment</td>
                <td style={{ padding: '16px 24px', color: '#3b82f6', verticalAlign: 'top', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span>Attachment ✎</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                    Required
                    <div style={{ width: '32px', height: '16px', backgroundColor: '#d1d5db', borderRadius: '16px', position: 'relative' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }}></div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#ef4444', verticalAlign: 'top', textAlign: 'right' }}>🗑</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Participants Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '0.9rem', fontWeight: '500' }}>
            Participants ˅
            <span style={{ backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>PO Vendor 1</span>
          </div>
        </div>

      </div>
    </div>
  );
}
