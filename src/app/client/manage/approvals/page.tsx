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
  <div style={{ padding: '12px 20px', borderRadius: '8px', background: '#f8fafc', border: '2px solid #3b82f6', minWidth: '180px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
      <Play size={14} /> TRIGGER
    </div>
    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>{data.label}</div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6', width: '8px', height: '8px' }} />
  </div>
);

const ApprovalNode = ({ data }: any) => (
  <div style={{ padding: '12px 20px', borderRadius: '8px', background: '#fff', border: '2px solid #8b5cf6', minWidth: '180px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#8b5cf6', width: '8px', height: '8px' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6d28d9', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
      <User size={14} /> APPROVAL
    </div>
    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>{data.label}</div>
    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>Assigned to: {data.assignee || 'Unassigned'}</div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#8b5cf6', width: '8px', height: '8px' }} />
  </div>
);

const ConditionNode = ({ data }: any) => (
  <div style={{ padding: '16px 20px', borderRadius: '8px', background: '#fff', border: '2px solid #f59e0b', minWidth: '180px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#f59e0b', width: '8px', height: '8px' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#b45309', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
      <GitMerge size={14} /> CONDITION
    </div>
    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>{data.label}</div>
    
    <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%', background: '#10b981', width: '10px', height: '10px' }} />
    <div style={{ position: 'absolute', bottom: '-20px', left: '20%', fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>TRUE</div>
    
    <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%', background: '#ef4444', width: '10px', height: '10px' }} />
    <div style={{ position: 'absolute', bottom: '-20px', left: '60%', fontSize: '10px', color: '#ef4444', fontWeight: 'bold' }}>FALSE</div>
  </div>
);

const ActionNode = ({ data }: any) => (
  <div style={{ padding: '12px 20px', borderRadius: '8px', background: '#fff', border: '2px solid #10b981', minWidth: '180px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#10b981', width: '8px', height: '8px' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#047857', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
      <Server size={14} /> ACTION
    </div>
    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>{data.label}</div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#10b981', width: '8px', height: '8px' }} />
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', background: '#f8fafc', margin: '-32px' }}>
        {/* Builder Header */}
        <div style={{ height: '70px', background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setMode('list')} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flow Designer (ServiceNow Style)</span>
              <input 
                value={flowName} 
                onChange={e => setFlowName(e.target.value)} 
                style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', border: 'none', outline: 'none', background: 'transparent', padding: 0 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSaveFlow} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>
              <Save size={16} /> Save & Activate Flow
            </button>
          </div>
        </div>

        {/* Builder Canvas + Sidebar */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar Tools */}
          <div style={{ width: '280px', background: '#fff', borderRight: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', zIndex: 10 }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Add Nodes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => addNode('approval')} style={{ width: '100%', padding: '12px', background: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: '8px', color: '#6d28d9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <User size={18} /> User Approval
                </button>
                <button onClick={() => addNode('condition')} style={{ width: '100%', padding: '12px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <GitMerge size={18} /> If/Else Condition
                </button>
                <button onClick={() => addNode('action')} style={{ width: '100%', padding: '12px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '8px', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Server size={18} /> System Action
                </button>
              </div>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Instructions</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                Click a button above to drop a new node onto the canvas. <br/><br/>
                Drag from the colored dot at the bottom of a node to connect it to the top of the next node. <br/><br/>
                For Condition nodes, route the <strong>TRUE</strong> and <strong>FALSE</strong> paths to different actions.
              </p>
            </div>
          </div>

          {/* ReactFlow Canvas */}
          <div style={{ flex: 1, position: 'relative', background: '#f1f5f9' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              defaultEdgeOptions={{ type: 'smoothstep', style: { strokeWidth: 2, stroke: '#94a3b8' } }}
            >
              <Background color="#cbd5e1" gap={20} size={1} />
              <Controls style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <MiniMap nodeStrokeColor={(n) => {
                if (n.type === 'trigger') return '#3b82f6';
                if (n.type === 'approval') return '#8b5cf6';
                if (n.type === 'condition') return '#f59e0b';
                if (n.type === 'action') return '#10b981';
                return '#000';
              }} nodeColor="#fff" />
            </ReactFlow>
          </div>
        </div>
      </div>
    );
  }

  // List Mode (Default)
  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: '#0f172a', fontWeight: 800 }}>Workflow & Approvals</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Design visual, automated workflows for procurement processes.</p>
        </div>
        <button onClick={() => {
          setNodes(initialNodes); setEdges(initialEdges); setFlowName('New Visual Flow'); setMode('builder');
        }} style={{ padding: '12px 24px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: 'transform 0.1s' }}>
          <Plus size={18} /> Open Flow Designer
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}><div className="spinner"></div></div>
      ) : (
        workflows.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {workflows.map(w => {
              let approverList: string[] = [];
              try { approverList = JSON.parse(w.approvers || '[]'); } catch (e) {}
              
              return (
                <div key={w.id} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'inline-block', padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '10px' }}>{w.category}</div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{w.name}</h3>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Created: {new Date(w.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual Flow Path</div>
                    {approverList.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={10} /></div>
                           <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Trigger Start</div>
                        </div>
                        {approverList.map((ap: string, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px', borderLeft: '2px solid #e2e8f0', paddingLeft: '16px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f8faff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.6rem', flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '6px 10px', fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>{ap}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '16px' }}>Flow contains non-user actions</div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}><CheckCircle2 size={12} /> Active</div>
                    <button onClick={() => handleDelete(w.id)} style={{ padding: '6px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '7px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 600 }}><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '64px', textAlign: 'center', boxShadow: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldAlert size={30} color="#cbd5e1" /></div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>No workflows configured</div>
              <div style={{ color: '#475569', fontSize: '0.875rem', maxWidth: '380px' }}>Build your first visual approval flow to route PRs automatically.</div>
              <button onClick={() => {
                setNodes(initialNodes); setEdges(initialEdges); setFlowName('New Visual Flow'); setMode('builder');
              }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '12px 24px', background: '#0f172a', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}><Plus size={18} /> Open Flow Designer</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
