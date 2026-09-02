'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Activity, Clock, AlertCircle, ChevronDown, FileCheck, TrendingUp, Eye, Check, X, Edit2, Users, Award, Gavel, CheckCircle2, MoreHorizontal } from 'lucide-react';

const Countdown = ({ endTime }: { endTime: string | Date }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const diff = new Date(endTime).getTime() - now.getTime();
  if (diff <= 0) return <span style={{ color: '#dc2626', fontWeight: 700 }}>Ended</span>;
  const d = Math.floor(diff / 86400000), h = Math.floor((diff / 3600000) % 24), m = Math.floor((diff / 60000) % 60), s = Math.floor((diff / 1000) % 60);
  return <span style={{ color: '#2563eb', fontWeight: 700 }}>{d > 0 ? d + 'd ' : ''}{h > 0 || d > 0 ? h + 'h ' : ''}{m}m {s}s</span>;
};

export default function EventsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('LIVE');
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<any>(null);
  const [editingTimeFor, setEditingTimeFor] = useState<{ eventId: string; sIdx: number } | null>(null);
  const [newTimeVal, setNewTimeVal] = useState('');

  const [mockEvents] = useState<any[]>([
    { id: 'mock-1', account: 'Enterprise Corp', refId: 'RFX-20012', itemsCount: 2, title: 'Q3 Hardware Refresh', stages: [{ name: 'Technical Offer', statusIcon: <AlertCircle size={16} color="#f59e0b" />, timeText: 'Overdue by 1h', timeColor: '#dc2626', participants: '1/2', participantsColor: '#3b82f6', actionText: 'Send for Review', actionBadge: '1', actionType: 'warning' }] },
    { id: 'mock-2', account: 'Global Industries', refId: 'RFX-20009', itemsCount: 5, title: 'Software Licensing Renewal', stages: [{ name: 'RFQ Commercials', statusIcon: <Clock size={16} color="#3b82f6" />, timeText: 'Ends in 11 days', timeColor: '#475569', participants: '3/5', participantsColor: '#10b981', actionText: 'Evaluate Quotes', actionBadge: '3', actionType: 'primary' }] },
  ]);

  useEffect(() => {
    fetch('/api/events').then(async res => {
      if (!res.ok) throw new Error('Server ' + res.status);
      if ((res.headers.get('content-type') || '').includes('application/json')) return res.json();
      throw new Error('Invalid response');
    }).then(data => {
      if (Array.isArray(data)) {
        setDbEvents(data.map(e => ({
          id: e.refId, dbId: e.id, account: e.account || 'Internal', refId: e.refId, itemsCount: e.itemsCount || 1,
          title: e.title || 'Untitled', endTime: e.endTime, participants: e.participants,
          stages: [{ name: 'Live RFQ', statusIcon: <Activity size={16} color="#10b981" />, timeText: 'Live', timeColor: '#10b981', participants: 'View Bids', participantsColor: '#2563eb', actionText: 'Evaluate Bids', actionBadge: 'New', actionType: 'success' }]
        })));
      }
    }).catch(err => setFetchError(err.message));
  }, []);

  const allEvents = useMemo(() => [...dbEvents, ...mockEvents], [dbEvents]);

  const isHistorical = (e: any) => e.endTime ? new Date() > new Date(e.endTime) : e.stages.every((s: any) => s.timeText?.includes('Ended') || s.timeText?.includes('Overdue'));

  const filteredEvents = useMemo(() => allEvents.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.refId.toLowerCase().includes(q) || e.account.toLowerCase().includes(q);
    const matchTab = activeTab === 'ALL' || (activeTab === 'LIVE' ? !isHistorical(e) : isHistorical(e));
    return matchSearch && matchTab;
  }), [searchQuery, activeTab, allEvents]);

  const totalEvents = allEvents.length;
  const histCount = allEvents.filter(e => isHistorical(e)).length;
  const liveCount = totalEvents - histCount;

  const saveNewTime = async (eventId: string, isDb: boolean) => {
    if (!newTimeVal) { setEditingTimeFor(null); return; }
    if (isDb) {
      const res = await fetch('/api/events/' + eventId, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endTime: new Date(newTimeVal).toISOString() }) });
      if (res.ok) setDbEvents(prev => prev.map(e => (e.id === eventId || e.refId === eventId) ? { ...e, endTime: new Date(newTimeVal).toISOString() } : e));
      else alert('Failed to update');
    }
    setEditingTimeFor(null);
  };

  const statusBadge = (type: string) => {
    if (type === 'warning') return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
    if (type === 'success') return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
    return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  };

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 55%, #1a2f6b 100%)', padding: '28px 32px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(circle at 70% 50%, rgba(59,130,246,0.15), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Gavel size={22} color="rgba(255,255,255,0.7)" />
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Sourcing Events</p>
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Tenders &amp; Auctions</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0, fontSize: '0.9rem' }}>Manage RFQs, reverse auctions, and vendor bids in real-time.</p>
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#fff', color: '#1e3a8a', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <Plus size={16} /> Create Event <ChevronDown size={14} />
            </button>
            {isCreateMenuOpen && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '210px', overflow: 'hidden' }}>
                <div onClick={() => router.push('/client/events/create/single-stage')} style={{ padding: '13px 18px', fontSize: '0.875rem', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
                  <FileCheck size={16} color="#2563eb" /> Single Stage Event
                </div>
                <div onClick={() => router.push('/client/events/create/auction')} style={{ padding: '13px 18px', fontSize: '0.875rem', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
                  <TrendingUp size={16} color="#7c3aed" /> Reverse Auction
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 40px', marginTop: '-20px', position: 'relative', zIndex: 10 }}>
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Total Events', value: totalEvents, icon: Gavel, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Live Events', value: liveCount, icon: Activity, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Completed', value: histCount, icon: CheckCircle2, color: '#64748b', bg: '#f8fafc' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.05em' }}>{s.value}</div>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={s.color} />
                </div>
              </div>
            );
          })}
        </div>

        {fetchError && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '14px 18px', marginBottom: '16px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
            <AlertCircle size={18} /> {fetchError.includes('504') ? 'DB may be sleeping — please refresh in a moment.' : fetchError}
          </div>
        )}

        {/* Table Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {/* Tabs + Search */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              {['LIVE', 'HISTORY', 'ALL'].map(tab => (
                <div key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '7px 18px', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', background: activeTab === tab ? '#1e3a8a' : 'transparent', color: activeTab === tab ? '#fff' : '#64748b', transition: 'all 0.15s', letterSpacing: '0.04em' }}>
                  {tab}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', maxWidth: '440px' }}>
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder="Search by title, ref ID, or account..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: '#0f172a', padding: '10px 0', width: '100%' }} />
            </div>
          </div>

          {/* Event Rows */}
          <div style={{ backgroundColor: '#f8fafc' }}>
            {filteredEvents.length > 0 ? filteredEvents.map(event => {
              const ended = isHistorical(event);
              return (
                <div key={event.id} style={{ backgroundColor: '#fff', marginBottom: '1px', borderBottom: '1px solid #f1f5f9' }}>
                  {/* Row Header */}
                  <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid ' + (ended ? '#cbd5e1' : '#2563eb') }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb' }}>{event.refId}</span>
                        <span style={{ color: '#cbd5e1' }}>•</span>{event.account}
                        <span style={{ color: '#cbd5e1' }}>•</span>{event.itemsCount} items
                        {ended && <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f8fafc', color: '#64748b' }}>Closed</span>}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{event.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => setSelectedEventForDetails(event)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Eye size={14} /> Details
                      </button>
                      <button onClick={() => router.push('/client/events/' + event.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#1e3a8a', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                        View Bids <Eye size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Stage Rows */}
                  {event.stages.map((stage: any, sIdx: number) => {
                    const sb = statusBadge(stage.actionType);
                    return (
                      <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2fr', gap: '8px', alignItems: 'center', padding: '12px 24px 12px 28px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                          {stage.statusIcon}{stage.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: stage.timeColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {editingTimeFor?.eventId === event.id && editingTimeFor?.sIdx === sIdx ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input type="datetime-local" value={newTimeVal} onChange={e => setNewTimeVal(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }} />
                              <button onClick={() => saveNewTime(event.id, !!dbEvents.find(e => e.id === event.id))} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '5px', padding: '4px', cursor: 'pointer', display: 'flex' }}><Check size={13} /></button>
                              <button onClick={() => setEditingTimeFor(null)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '5px', padding: '4px', cursor: 'pointer', display: 'flex' }}><X size={13} /></button>
                            </div>
                          ) : (
                            <>
                              {event.endTime ? <Countdown endTime={event.endTime} /> : stage.timeText}
                              <button onClick={() => { setEditingTimeFor({ eventId: event.id, sIdx }); setNewTimeVal(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.15s' }} onMouseOver={e => (e.currentTarget as HTMLElement).style.color = '#2563eb'} onMouseOut={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}><Edit2 size={13} /></button>
                            </>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: stage.participantsColor, fontSize: '0.82rem', fontWeight: 600 }}>
                          <Users size={14} />{stage.name.includes('Live') ? '—' : stage.participants}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {stage.actionText && (
                            <button onClick={() => { if (stage.name.includes('Live')) router.push('/client/events/' + event.id); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '7px', fontWeight: 700, fontSize: '0.78rem', border: '1px solid ' + sb.border, backgroundColor: sb.bg, color: sb.color, cursor: 'pointer', transition: 'opacity 0.15s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                              {stage.actionText}
                              <span style={{ background: sb.color, color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem' }}>{stage.actionBadge}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }) : (
              <div style={{ padding: '72px', textAlign: 'center', backgroundColor: '#fff' }}>
                <Activity size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>No events found</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Try changing your filter or create a new sourcing event.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEventForDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedEventForDetails(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '560px', maxWidth: '92vw', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'slideUp 0.25s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #071330, #0d1f4f)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Event Details</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{selectedEventForDetails.refId}</p>
              </div>
              <button onClick={() => setSelectedEventForDetails(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Title</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{selectedEventForDetails.title}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{selectedEventForDetails.account}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items Count</p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedEventForDetails.itemsCount} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>line items</span></p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: isHistorical(selectedEventForDetails) ? '#64748b' : '#16a34a' }}>{isHistorical(selectedEventForDetails) ? 'Completed' : 'Active'}</p>
                </div>
              </div>
              {(() => {
                let vendors: any[] = [];
                try { vendors = typeof selectedEventForDetails.participants === 'string' ? JSON.parse(selectedEventForDetails.participants) : selectedEventForDetails.participants || []; } catch(e) {}
                if (!vendors?.length) return null;
                return (
                  <div>
                    <p style={{ margin: '0 0 10px', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invited Vendors</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {vendors.map((v: any, i: number) => (
                        <span key={i} style={{ padding: '5px 12px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '0.8rem', fontWeight: 600 }}>{v.name || v.email || 'Vendor'}</span>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <button onClick={() => setSelectedEventForDetails(null)} style={{ flex: 1, padding: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', fontWeight: 600, color: '#475569', cursor: 'pointer', fontSize: '0.875rem' }}>Close</button>
                <button onClick={() => { setSelectedEventForDetails(null); router.push('/client/events/' + selectedEventForDetails.id); }} style={{ flex: 1, padding: '11px', background: '#1e3a8a', border: 'none', borderRadius: '9px', fontWeight: 700, color: '#fff', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
                  View Bids <Eye size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: '@keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }' }} />
    </div>
  );
}


