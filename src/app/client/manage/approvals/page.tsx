'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, Node, Edge, Handle, Position, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowRight, Trash2, Plus, X, Search, CheckCircle2, ShieldAlert, GitMerge, Mail, Play, Save, ChevronLeft, User, Server } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: 'PR Submitted' },
  },
];

const initialEdges: Edge[] = [];

// Custom Node Components
const TriggerNode = ({ data }: any) => (
  <div style={{ padding: '16px 24px', borderRadius: '16px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#fff', minWidth: '220px', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#93c5fd', fontWeight: 800, fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <Play size={14} /> TRIGGER EVENT
    </div>
    <input 
      className="nodrag"
      defaultValue={data.label}
      onChange={e => data.label = e.target.value}
      style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'rgba(0,0,0,0.1)', border: '1px dashed rgba(255,255,255,0.3)', color: '#fff', textAlign: 'center', width: '100%', borderRadius: '8px', padding: '4px', outline: 'none' }} 
    />
    <Handle type="source" position={Position.Bottom} style={{ background: '#fff', width: '12px', height: '12px', border: '3px solid #3b82f6', bottom: '-6px' }} />
  </div>
);

const ApprovalNode = ({ data }: any) => (
  <div style={{ padding: '16px 24px', borderRadius: '16px', background: '#ffffff', minWidth: '220px', textAlign: 'center', boxShadow: '0 15px 35px -5px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#fff', width: '12px', height: '12px', border: '3px solid #8b5cf6', top: '-6px' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#8b5cf6', fontWeight: 800, fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <User size={14} /> APPROVAL STEP
    </div>
    <input 
      className="nodrag"
      defaultValue={data.label}
      onChange={e => data.label = e.target.value}
      style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'transparent', border: '1px dashed #cbd5e1', textAlign: 'center', width: '100%', borderRadius: '8px', padding: '4px', outline: 'none', marginBottom: '4px' }} 
    />
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 12px', borderRadius: '20px', color: '#475569', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600, border: '1px solid #e2e8f0' }}>
      <User size={12} color="#8b5cf6" />
      <input 
        className="nodrag"
        defaultValue={data.assignee || 'Unassigned'}
        onChange={e => data.assignee = e.target.value}
        style={{ background: 'transparent', border: 'none', outline: 'none', width: '90px', color: '#475569', fontWeight: 600 }}
        placeholder="Assign to..."
      />
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#fff', width: '12px', height: '12px', border: '3px solid #8b5cf6', bottom: '-6px' }} />
  </div>
);

const ConditionNode = ({ data }: any) => (
  <div style={{ padding: '16px 24px', borderRadius: '16px', background: '#ffffff', minWidth: '240px', textAlign: 'center', boxShadow: '0 15px 35px -5px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#fff', width: '12px', height: '12px', border: '3px solid #f59e0b', top: '-6px' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <GitMerge size={14} /> LOGIC CONDITION
    </div>
    <input 
      className="nodrag"
      defaultValue={data.label}
      onChange={e => data.label = e.target.value}
      style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'transparent', border: '1px dashed #cbd5e1', textAlign: 'center', width: '100%', borderRadius: '8px', padding: '4px', outline: 'none', marginBottom: '8px' }} 
    />
    
    <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%', background: '#fff', width: '12px', height: '12px', border: '3px solid #10b981', bottom: '-6px' }} />
    <div style={{ position: 'absolute', bottom: '-26px', left: '15%', fontSize: '11px', color: '#059669', fontWeight: 800, background: '#ecfdf5', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>TRUE</div>
    
    <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%', background: '#fff', width: '12px', height: '12px', border: '3px solid #ef4444', bottom: '-6px' }} />
    <div style={{ position: 'absolute', bottom: '-26px', left: '65%', fontSize: '11px', color: '#dc2626', fontWeight: 800, background: '#fef2f2', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fecaca' }}>FALSE</div>
  </div>
);

const ActionNode = ({ data }: any) => (
  <div style={{ padding: '16px 24px', borderRadius: '16px', background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: '#fff', minWidth: '220px', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#10b981', width: '12px', height: '12px', border: '2px solid #fff', top: '-6px' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10b981', fontWeight: 800, fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <Server size={14} /> AUTOMATED ACTION
    </div>
    <input 
      className="nodrag"
      defaultValue={data.label}
      onChange={e => data.label = e.target.value}
      style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.2)', color: '#fff', textAlign: 'center', width: '100%', borderRadius: '8px', padding: '4px', outline: 'none' }} 
    />
    <Handle type="source" position={Position.Bottom} style={{ background: '#10b981', width: '12px', height: '12px', border: '2px solid #fff', bottom: '-6px' }} />
  </div>
);

const nodeTypes = {

  trigger: TriggerNode,
  approval: ApprovalNode,
  condition: ConditionNode,
  action: ActionNode
};

export default function ApprovalsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'builder'>('list');
  const [systemUsers, setSystemUsers] = useState<any[]>([]);

  // ReactFlow state
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [flowName, setFlowName] = useState('Untitled Workflow');

  useEffect(() => {
    fetch('/api/workflows').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setWorkflows(data);
      setLoading(false);
    }).catch(() => setLoading(false));

    fetch('/api/users').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setSystemUsers(data);
    }).catch(() => {});
  }, []);

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)), []);

  const addNode = (type: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      type,
      position: { x: 250, y: nodes.length * 120 + 50 },
      data: { label: type === 'approval' ? 'Manager Approval' : type === 'condition' ? 'Amount > $10K' : 'Update ERP' }
    };
    if (type === 'approval') {
      newNode.data.assignee = 'IT Director';
    }
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSaveFlow = async () => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: flowName,
          category: 'Custom Flow',
          approvers: JSON.stringify(nodes.filter(n => n.type === 'approval').map(n => n.data.assignee || 'System')),
        })
      });
      if (res.ok) {
        const wf = await res.json();
        setWorkflows([wf, ...workflows]);
        setMode('list');
      }
    } catch (e) {
      alert("Error saving flow");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workflow?')) return;
    const res = await fetch(`/api/workflows?id=${id}`, { method: 'DELETE' });
    if (res.ok) setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  if (mode === 'builder') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#f8fafc', zIndex: 1000, overflow: 'hidden' }}>
        
        {/* Full Screen Canva-style Canvas */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{ type: 'smoothstep', style: { strokeWidth: 3, stroke: '#cbd5e1' } }}
          >
            <Background color="#cbd5e1" gap={24} size={2} />
            <Controls style={{ background: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }} />
            <MiniMap 
              style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', overflow: 'hidden' }}
              nodeColor={(n) => {
              if (n.type === 'trigger') return '#3b82f6';
              if (n.type === 'approval') return '#8b5cf6';
              if (n.type === 'condition') return '#f59e0b';
              if (n.type === 'action') return '#10b981';
              return '#cbd5e1';
            }} />
          </ReactFlow>
        </div>

        {/* Canva-style Floating Header Overlay */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          
          {/* Left Side: Name and Back */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '10px 20px', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.4)' }}>
            <button onClick={() => setMode('list')} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0f172a', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
            <input 
              value={flowName} 
              onChange={e => setFlowName(e.target.value)} 
              style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', border: 'none', outline: 'none', background: 'transparent', padding: '4px 8px', width: '250px' }}
              placeholder="Name your design..."
            />
          </div>

          {/* Right Side: Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSaveFlow} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <Save size={18} /> Save Flow
            </button>
          </div>
        </div>

        {/* Canva-style Floating Tool Panel (Left) */}
        <div style={{ position: 'absolute', top: '90px', left: '24px', width: '80px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '12px', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            
            <button onClick={() => addNode('approval')} style={{ width: '56px', height: '56px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#8b5cf6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#8b5cf6'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
              <User size={22} />
              <span style={{ fontSize: '9px', fontWeight: 700 }}>Approve</span>
            </button>

            <button onClick={() => addNode('condition')} style={{ width: '56px', height: '56px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#f59e0b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#f59e0b'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
              <GitMerge size={22} />
              <span style={{ fontSize: '9px', fontWeight: 700 }}>Logic</span>
            </button>

            <button onClick={() => addNode('action')} style={{ width: '56px', height: '56px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#10b981'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
              <Server size={22} />
              <span style={{ fontSize: '9px', fontWeight: 700 }}>Action</span>
            </button>

          </div>
        </div>

      </div>
    );
  }

  // List Mode (Default)
  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '16px' }}>
            <Server size={14} /> Workflow Automation Engine
          </div>
          <h1 style={{ margin: '0 0 12px 0', fontSize: '2.2rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em' }}>Flow & Approvals</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.5 }}>Design visual, automated workflows for procurement processes. Build complex multi-stage approvals, conditionals, and system actions instantly.</p>
        </div>
        <button onClick={() => {
          setNodes(initialNodes); setEdges(initialEdges); setFlowName('New Visual Flow'); setMode('builder');
        }} style={{ padding: '14px 28px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)', transition: 'all 0.2s', backgroundImage: 'linear-gradient(to right, #0f172a, #1e293b)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <Plus size={18} /> Open Flow Designer
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        workflows.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
            {workflows.map(w => {
              let approverList: string[] = [];
              try { 
                let parsed = JSON.parse(w.approvers || '[]'); 
                if (Array.isArray(parsed)) {
                  approverList = parsed;
                } else if (typeof parsed === 'string') {
                  approverList = [parsed];
                }
              } catch (e) {
                if (typeof w.approvers === 'string' && w.approvers.length > 0) {
                  approverList = [w.approvers];
                }
              }
              
              return (
                <div key={w.id} style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#cbd5e1'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                  
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <div style={{ display: 'inline-flex', padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '12px', border: '1px solid #e2e8f0' }}>{w.category || 'Custom Flow'}</div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>{w.name}</h3>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Updated {new Date(w.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}><GitMerge size={12} /> Execution Path</div>
                    {approverList.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(37,99,235,0.1)' }}><Play size={12} /></div>
                           <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Trigger Event</div>
                        </div>
                        {approverList.map((ap: string, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '13px', borderLeft: '2px dashed #cbd5e1', paddingLeft: '14px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f8faff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0, border: '1px solid #e2e8f0' }}>{i + 1}</div>
                            <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}><User size={14} color="#64748b" /> {ap}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Flow contains non-user actions</div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}><CheckCircle2 size={14} /> Active</div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }} style={{ padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '80px', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}><GitMerge size={36} color="#64748b" /></div>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.5rem', margin: '0 0 12px 0' }}>No workflows configured</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '400px', margin: '0 0 32px 0', lineHeight: 1.5 }}>Build your first visual approval flow to route purchase requests automatically through your organization.</p>
            <button onClick={() => {
              setNodes(initialNodes); setEdges(initialEdges); setFlowName('New Visual Flow'); setMode('builder');
            }} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 32px', background: '#2563eb', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}><Plus size={20} /> Open Flow Designer</button>
          </div>
        )
      )}
    </div>
  );
}