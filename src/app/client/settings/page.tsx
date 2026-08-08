'use client';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [workflowsEnabled, setWorkflowsEnabled] = useState(false);

  useEffect(() => {
    setWorkflowsEnabled(localStorage.getItem('enableWorkflows') === 'true');
  }, []);

  const handleToggle = (checked: boolean) => {
    setWorkflowsEnabled(checked);
    localStorage.setItem('enableWorkflows', checked ? 'true' : 'false');
    window.dispatchEvent(new Event('settings_updated'));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="surface">
        <h3 style={{ marginBottom: '20px', color: 'var(--accent-color)' }}>Profile Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" defaultValue="John Buyer" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" defaultValue="john@company.com" disabled />
          </div>
        </div>
        
        <h3 style={{ margin: '30px 0 20px', color: 'var(--accent-color)' }}>Preferences</h3>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" defaultChecked />
            Receive Email Notifications
          </label>
        </div>

        <h3 style={{ margin: '30px 0 20px', color: 'var(--accent-color)' }}>Experimental Features</h3>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{
              width: '44px',
              height: '24px',
              backgroundColor: workflowsEnabled ? '#10b981' : '#e5e7eb',
              borderRadius: '12px',
              position: 'relative',
              transition: 'background-color 0.2s'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: workflowsEnabled ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }} />
            </div>
            <input 
              type="checkbox" 
              checked={workflowsEnabled} 
              onChange={(e) => handleToggle(e.target.checked)} 
              style={{ display: 'none' }} 
            />
            <span style={{ fontWeight: '500', color: '#374151' }}>Enable Workflows Module</span>
          </label>
          <p style={{ margin: '4px 0 0 56px', fontSize: '0.85rem', color: '#6b7280' }}>
            Turns on the Workflows menu item in the Manage sidebar section.
          </p>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
