'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hardcoded current user email for demo purposes (normally from auth)
  const currentUserEmail = 'admin@company.com';

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals');
      const data = await res.json();
      if (Array.isArray(data)) setApprovals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (approvalId: string, action: 'approve' | 'reject') => {
    if (action === 'reject') {
      const confirm = window.confirm('Are you sure you want to reject this request? This will cancel the event.');
      if (!confirm) return;
    }

    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId,
          action,
          userEmail: currentUserEmail
        })
      });

      if (res.ok) {
        // Refresh approvals list
        fetchApprovals();
      } else {
        alert(`Failed to ${action} request.`);
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  const pendingCount = approvals.filter(a => a.status === 'Pending').length;

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#d97706', display: 'flex' }}>
              <Clock size={24} />
            </div>
            My Approvals
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Review and approve pending Sourcing Events.</p>
        </div>
        
        <div style={{ padding: '12px 24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: pendingCount > 0 ? '#d97706' : '#10b981' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Actions</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading approvals...</div>
        ) : approvals.length === 0 ? (
          <div style={{ backgroundColor: '#fff', padding: '48px', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.25rem' }}>All caught up!</h3>
            <p style={{ margin: 0, color: '#64748b' }}>You have no pending approvals in your queue.</p>
          </div>
        ) : (
          approvals.map(approval => {
            const isPending = approval.status === 'Pending';
            const isApproved = approval.status === 'Approved';
            const isRejected = approval.status === 'Rejected';
            
            // For demo purposes, we allow action if it's pending. 
            // In a real app, we'd check if `approval.currentApproverEmail === currentUserEmail`.
            
            return (
              <div key={approval.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', transition: 'transform 0.2s' }}>
                <div style={{ width: '6px', backgroundColor: isApproved ? '#10b981' : isRejected ? '#ef4444' : '#f59e0b' }} />
                <div style={{ padding: '24px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', letterSpacing: '0.05em' }}>{approval.eventRef}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e0e7ff', color: '#4f46e5' }}>{approval.category}</span>
                    </div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#0f172a' }}>{approval.eventTitle}</h2>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} /> Created on {new Date(approval.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isPending && <span style={{ color: '#d97706', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> Pending your approval</span>}
                      {isApproved && <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={16} /> Approved</span>}
                      {isRejected && <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={16} /> Rejected</span>}
                    </div>

                    {isPending && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={() => handleAction(approval.id, 'reject')}
                          style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleAction(approval.id, 'approve')}
                          style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                        >
                          Approve
                        </button>
                      </div>
                    )}
                    
                    {!isPending && (
                      <button 
                        onClick={() => router.push(`/client/events/${approval.eventId}`)}
                        style={{ padding: '6px 12px', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        View Event <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
