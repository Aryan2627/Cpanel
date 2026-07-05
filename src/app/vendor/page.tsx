import Link from 'next/link';

export default function VendorPortal() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">Vendor Portal</div>
        <ul className="sidebar-nav">
          <li><Link href="/vendor" className="active">Dashboard</Link></li>
          <li><Link href="/vendor/events">Active RFQs / Events</Link></li>
          <li><Link href="#">My Bids</Link></li>
          <li><Link href="#">Purchase Orders</Link></li>
          <li><Link href="#">Profile Settings</Link></li>
        </ul>
        <div style={{ padding: '24px' }}>
          <Link href="/" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
            Logout
          </Link>
        </div>
      </aside>
      <main className="main-content animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Vendor Dashboard</h1>
        </div>
        <div className="surface">
          <p>Welcome to the Vendor Portal. Here you can view invitations for RFQs, submit bids, and manage your purchase orders.</p>
        </div>
      </main>
    </div>
  );
}
