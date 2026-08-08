'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function TourButton() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartTour = () => {
    let steps: any[] = [];

    if (pathname === '/client') {
      steps = [
        { element: '#tour-kpi-cards', popover: { title: 'Dashboard KPIs', description: "These cards give you a bird's-eye view of your procurement health, like total spend and active events.", side: 'bottom', align: 'start' } },
        { element: '#tour-recent-events', popover: { title: 'Recent Events', description: 'Monitor all your recent sourcing events and auctions in real-time right from here.', side: 'top', align: 'start' } }
      ];
    } else if (pathname === '/client/intake') {
      steps = [
        { element: '#tour-create-intake', popover: { title: 'Create Intake', description: 'Start here to submit a new purchase request for approval.', side: 'left', align: 'start' } },
        { element: '#tour-intake-status', popover: { title: 'Status Tracking', description: 'Watch this column to see if your request is Pending, Approved, or Rejected by management.', side: 'bottom', align: 'start' } }
      ];
    } else if (pathname === '/client/events/create/single-stage') {
      steps = [
        { element: '#tour-workspace-btn', popover: { title: 'Split-Screen Workspace', description: 'Click here to open your intakes and drag-and-drop them instantly into your event.', side: 'bottom', align: 'start' } },
        { element: '#tour-template-selector', popover: { title: 'Smart Templates', description: 'Select a category template. This dictates exactly what fields the vendors need to fill out.', side: 'bottom', align: 'start' } },
        { element: '#tour-line-items', popover: { title: 'Line Items Grid', description: 'Pro tip: You can click anywhere in this grid and press Ctrl+V to paste multiple rows directly from Excel!', side: 'top', align: 'start' } }
      ];
    } else if (pathname === '/client/vendors/messages') {
      steps = [
        { element: '#tour-vendor-list', popover: { title: 'Vendor Directory', description: 'Switch between your active supplier conversations here.', side: 'right', align: 'start' } },
        { element: '#tour-chat-area', popover: { title: 'Real-Time Chat', description: 'Messages sync instantly. Blue bubbles are yours, white are the vendors.', side: 'left', align: 'start' } },
        { element: '#tour-chat-input', popover: { title: 'Send Message', description: 'Type your message and hit Enter to instantly send it to the supplier.', side: 'top', align: 'center' } }
      ];
    } else if (pathname === '/client/manage/workflows') {
      steps = [
        { element: '#tour-workflow-intro', popover: { title: 'Platform Database', description: 'This is where you configure all dropdowns for the entire platform without touching a backend database.', side: 'bottom', align: 'start' } },
        { element: '#tour-workflow-categories', popover: { title: 'Dynamic Lists', description: 'Add a new category here, and it instantly becomes available when creating a new product.', side: 'top', align: 'center' } }
      ];
    } else if (pathname === '/client/manage/users') {
      steps = [
        { element: '#tour-create-user-btn', popover: { title: 'Create User', description: 'Click here to slide out the premium user creation panel.', side: 'left', align: 'center' } },
        { element: '#tour-user-roles', popover: { title: 'Visual Roles', description: 'Notice how roles are visually tagged with distinct colors for easy scanning.', side: 'top', align: 'start' } }
      ];
    } else if (pathname === '/client/manage/products/create') {
      steps = [
        { element: '#tour-product-form', popover: { title: 'Product Form', description: 'Enter the details of the product you want to add to your catalog.', side: 'top', align: 'start' } },
        { element: '#tour-product-image', popover: { title: 'Image Dropzone', description: 'Drag and drop high-quality images of your product right here.', side: 'left', align: 'start' } }
      ];
    } else {
      steps = [
        { popover: { title: 'Explore ProcGen', description: 'Welcome to the platform! Navigate using the left sidebar to explore different modules.', side: 'bottom', align: 'start' } }
      ];
    }

    const d = driver({
      showProgress: true,
      animate: true,
      steps
    });
    
    d.drive();
  };

  if (!mounted) return null;

  return (
    <button 
      onClick={handleStartTour}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'transform 0.2s, background-color 0.2s'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.backgroundColor = '#2563eb'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = '#3b82f6'; }}
      title="Start Page Tour"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </button>
  );
}
