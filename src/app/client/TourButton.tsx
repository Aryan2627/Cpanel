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

    // Detailed multi-step tours for every major route
    switch (true) {
      case pathname === '/client':
        steps = [
          { popover: { title: 'Welcome to ProcGen Dashboard', description: 'This is your central command center. Here you can get a high-level overview of all your procurement activities.' } },
          { element: '.sidebar', popover: { title: 'Main Navigation', description: 'Use this sidebar to access Intakes, Sourcing Events, Purchase Orders, and Platform Settings.' } },
          { element: '#tour-kpi-cards', popover: { title: 'Live KPIs', description: 'These cards display real-time metrics including your total spend, active events, and pending approvals.' } },
          { element: '#tour-recent-events', popover: { title: 'Recent Activity', description: 'Quickly jump back into your most recent sourcing events and auctions directly from this widget.' } }
        ];
        break;
        
      case pathname === '/client/intake':
      case pathname === '/client/pr':
        steps = [
          { popover: { title: 'Intake Management', description: 'This page is where all internal purchase requests (Intakes/PRs) are tracked and managed.' } },
          { element: '#tour-create-intake', popover: { title: 'Create New Request', description: 'Click here to submit a new material or service request to the procurement team.' } },
          { element: 'table', popover: { title: 'Request Tracking', description: 'This table shows the real-time status of every request. You can see whether a request is Pending, Approved, or Rejected.' } }
        ];
        break;

      case pathname === '/client/events':
        steps = [
          { popover: { title: 'Sourcing Events', description: 'Manage all your RFQs, RFPs, and Reverse Auctions from this unified event directory.' } },
          { element: 'button', popover: { title: 'Launch New Event', description: 'Click here to create a new sourcing event. You can choose between a standard RFQ or a dynamic Reverse Auction.' } },
          { element: 'table', popover: { title: 'Event Dashboard', description: 'Monitor the status of your live events, track vendor participation, and review incoming bids.' } }
        ];
        break;

      case pathname.includes('/client/events/create'):
        steps = [
          { popover: { title: 'Event Builder', description: 'Welcome to the Event Builder! This is where you configure your RFQ or Auction before sending it to vendors.' } },
          { element: 'button', popover: { title: 'Workspace Toggle', description: 'Pro Tip: Click this to open a split-screen view of your pending Intakes, allowing you to drag-and-drop items directly into this event!' } },
          { element: 'select', popover: { title: 'Smart Templates', description: 'Selecting a template will automatically load the specific technical questions and fields that vendors must answer.' } },
          { element: 'table', popover: { title: 'Line Items Grid', description: 'Add your requested items here. You can manually add rows, or click inside the grid and press Ctrl+V to paste directly from Excel!' } },
          { popover: { title: 'Publishing', description: 'Once you invite vendors and configure your dates, hit publish to instantly notify all invited suppliers.' } }
        ];
        break;

      case pathname === '/client/po':
        steps = [
          { popover: { title: 'Purchase Orders', description: 'This module tracks all finalized Purchase Orders generated from awarded events or direct purchases.' } },
          { element: 'table', popover: { title: 'PO Ledger', description: 'View PO amounts, vendor assignments, and current fulfillment statuses. Click any row to view the detailed PDF.' } }
        ];
        break;

      case pathname === '/client/vendors':
        steps = [
          { popover: { title: 'Vendor Directory', description: 'Your secure, isolated database of suppliers and partners.' } },
          { element: 'button', popover: { title: 'Onboard Vendor', description: 'Click to invite a new supplier. They will receive an email to securely register and join your tenant network.' } },
          { element: 'table', popover: { title: 'Performance Metrics', description: 'Track vendor compliance, onboarding status, and historical performance.' } }
        ];
        break;
        
      case pathname.includes('/client/vendors/messages'):
        steps = [
          { popover: { title: 'Supplier Collaboration', description: 'Communicate directly with your suppliers in real-time, keeping all audit trails in one place.' } },
          { element: 'ul', popover: { title: 'Active Conversations', description: 'Select a vendor from this list to view your chat history with them.' } },
          { element: 'input', popover: { title: 'Instant Messaging', description: 'Type your message and press Enter. Vendors receive instant notifications in their portal.' } }
        ];
        break;

      case pathname === '/client/manage/products':
        steps = [
          { popover: { title: 'Product Master', description: 'Maintain your standardized catalog of materials and services here to ensure clean data across all POs.' } },
          { element: 'button', popover: { title: 'Add or Bulk Upload', description: 'You can create products manually or use the Bulk Upload tool to import thousands of items from your ERP via CSV.' } },
          { element: 'table', popover: { title: 'Catalog', description: 'Use the action column to edit product details, update categories, or change HSN codes.' } }
        ];
        break;

      case pathname === '/client/manage/users':
        steps = [
          { popover: { title: 'User Access Management', description: 'Control who has access to your procurement portal and what permissions they hold.' } },
          { element: 'button', popover: { title: 'Create / Edit Users', description: 'Click to add a new team member. We strictly enforce unique emails and phone numbers to prevent duplicate accounts.' } },
          { element: 'table', popover: { title: 'Role-Based Access', description: 'Assign roles like Admin, Manager, or Member to restrict access to sensitive financial data.' } }
        ];
        break;

      case pathname === '/client/manage/workflows':
        steps = [
          { popover: { title: 'Platform Configurations', description: 'This powerful module lets you customize dropdown menus and lists across the entire platform without needing a developer.' } },
          { element: 'h3', popover: { title: 'Dynamic Variables', description: 'Add new Categories, Departments, or UOMs here, and they instantly become available in forms for all your users.' } }
        ];
        break;

      default:
        steps = [
          { popover: { title: 'Explore the Platform', description: 'Welcome to ProcGen! Use the navigation menu on the left to explore different modules. Click this question mark anytime you need a guided tour of the page you are on.' } }
        ];
    }

    // Fallback error handling if an element selector fails
    try {
      const d = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayClickNext: true,
        steps: steps.map(step => {
          // If the step has an element but it doesn't exist on the DOM, convert it to a center popover so it doesn't break
          if (step.element && !document.querySelector(step.element)) {
            return { popover: { ...step.popover } };
          }
          return step;
        })
      });
      
      d.drive();
    } catch (e) {
      console.error("Tour failed to start", e);
    }
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
        backgroundColor: '#2563eb', // Deeper enterprise blue
        color: '#fff',
        border: 'none',
        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'; 
        e.currentTarget.style.backgroundColor = '#1d4ed8'; 
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.6)';
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.transform = 'scale(1) translateY(0)'; 
        e.currentTarget.style.backgroundColor = '#2563eb'; 
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.4)';
      }}
      title="Start Page Tour"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </button>
  );
}
