/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It handles standard logic and rendering.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import Link from 'next/link';

/**
 * Renders the main AdminDashboard component.
 * This component handles its own local state and orchestrates user interactions.
 */
export default function AdminDashboard() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">Admin Dashboard</div>
        <ul className="sidebar-nav">
          <li><Link href="/admin" className="active">Overview</Link></li>
          <li><Link href="#">User Management</Link></li>
          <li><Link href="#">System Logs</Link></li>
          <li><Link href="#">Settings</Link></li>
        </ul>
        <div style={{ padding: '24px' }}>
          <Link href="/" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
            Logout
          </Link>
        </div>
      </aside>
      <main className="main-content animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Admin Overview</h1>
        </div>
        <div className="surface">
          <p>System is running smoothly. From here you can manage all users and overall system settings.</p>
        </div>
      </main>
    </div>
  );
}
