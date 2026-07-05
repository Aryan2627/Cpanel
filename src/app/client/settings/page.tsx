export default function SettingsPage() {
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
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" defaultChecked />
            Receive Email Notifications
          </label>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
