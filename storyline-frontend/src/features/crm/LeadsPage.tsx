import React, { useState, useEffect, type FormEvent } from 'react';
import { crmApi } from '../../api/client';
import LeadDetailsDrawer from './LeadDetailsDrawer';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Search, MoreVertical, Calendar, IndianRupee } from 'lucide-react';

// Sortable Item Component
function SortableLeadCard({ lead, onClick, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id.toString(), data: lead });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPriority = lead.budget && lead.budget > 100000; // Example logic for "priority"
  const cardClass = isPriority ? 'kanban-card priority-card' : 'kanban-card';

  // Map event type to a color
  const getBadgeColor = (type: string) => {
    if (!type) return 'gray';
    const t = type.toLowerCase();
    if (t.includes('wedding')) return 'purple';
    if (t.includes('corporate')) return 'blue';
    if (t.includes('party')) return 'orange';
    if (t.includes('concert')) return 'red';
    return 'green';
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={cardClass} onClick={() => onClick(lead.id)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div className={`badge-pastel ${getBadgeColor(lead.eventType)}`}>{lead.eventType || 'New Lead'}</div>
        <button className="btn btn-ghost" style={{ padding: 4 }} onClick={(e) => { e.stopPropagation(); onEdit(lead); }}><MoreVertical size={16} /></button>
      </div>
      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{lead.name}</div>
      <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '12px' }}>{lead.company || lead.email || lead.phone}</div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <Calendar size={14} /> 24 May
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <IndianRupee size={14} /> {lead.budget ? (lead.budget/1000).toFixed(0) + 'k' : '—'}
           </div>
        </div>
        <div className="avatar-group">
           <div className="avatar" title={lead.name}>{lead.name.charAt(0).toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}

const COLUMNS = [
  { id: 'NEW', title: 'New Leads', color: 'blue' },
  { id: 'CONTACTED', title: 'Contacted', color: 'yellow' },
  { id: 'QUALIFIED', title: 'Qualified', color: 'purple' },
  { id: 'PROPOSAL_SENT', title: 'Proposal Sent', color: 'gray' },
  { id: 'CONVERTED', title: 'Converted', color: 'green' },
  { id: 'LOST', title: 'Lost', color: 'red' }
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', eventType: '', budget: '', source: '', requirements: '', eventLocation: '', assignedToUserId: '', existingClientId: ''
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await crmApi.listLeads({ search });
      setLeads(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.content || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if ((formData as any).id) {
        await crmApi.updateLead((formData as any).id, { ...formData, budget: formData.budget ? parseFloat(formData.budget) : null });
      } else {
        await crmApi.createLead({ ...formData, budget: formData.budget ? parseFloat(formData.budget) : null });
      }
      setShowModal(false);
      fetchLeads();
    } catch (err) {
      alert('Failed to save lead.');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const lead = leads.find(l => l.id.toString() === active.id);
    setActiveDragItem(lead);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const leadId = parseInt(active.id);
    // Find if it was dropped over a column or another card
    const overId = over.id.toString();
    const isColumn = COLUMNS.some(c => c.id === overId);
    
    let newStatus = '';
    if (isColumn) {
       newStatus = overId;
    } else {
       const overLead = leads.find(l => l.id.toString() === overId);
       if (overLead) newStatus = overLead.status;
    }

    const activeLead = leads.find(l => l.id === leadId);
    if (!activeLead || !newStatus || activeLead.status === newStatus) return;

    let lostReason = null;
    if (newStatus === 'LOST') {
       lostReason = prompt("Please enter the reason for losing this lead:");
       if (lostReason === null) return; // User cancelled
    }

    // Optimistic Update
    const previousLeads = [...leads];
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    try {
      if (newStatus === 'CONVERTED') {
         await crmApi.convertLead(leadId, {});
      } else {
         await crmApi.updateLead(leadId, { ...activeLead, status: newStatus, lostReason: lostReason || activeLead.lostReason });
      }
    } catch (err) {
      console.error(err);
      setLeads(previousLeads);
      alert('Failed to update status.');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Pipeline</h1>
          <p className="page-subtitle">Manage your prospects and active deals</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
            <input
              type="text" className="form-input" placeholder="Search..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '250px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => { setFormData({} as any); setShowModal(true); }}>
            <Plus size={18} style={{ marginRight: 6 }} /> New Lead
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const columnLeads = leads.filter(l => l.status === col.id);
            return (
              <div key={col.id} className="kanban-column" id={col.id}>
                <div className="kanban-column-header">
                  <div className={`badge-pastel ${col.color}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                    {col.title}
                  </div>
                  <span className={`badge-solid ${col.id === 'NEW' ? 'blue' : 'dark'}`} style={{ borderRadius: '50%', width: 24, height: 24, justifyContent: 'center', padding: 0 }}>
                    {columnLeads.length}
                  </span>
                </div>
                
                <SortableContext items={columnLeads.map(l => l.id.toString())} strategy={verticalListSortingStrategy}>
                  <div className="kanban-column-body">
                    {columnLeads.map(lead => (
                      <SortableLeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onClick={setSelectedLeadId}
                        onEdit={(l: any) => { setFormData(l); setShowModal(true); }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
        
        <DragOverlay>
          {activeDragItem ? (
            <div className="kanban-card" style={{ transform: 'rotate(3deg)', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ fontWeight: 600 }}>{activeDragItem.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{activeDragItem.company || activeDragItem.email}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Drawer */}
      {selectedLeadId && (
        <LeadDetailsDrawer
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={() => fetchLeads()}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowModal(false)}>
           <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
             <div className="card-header">
               <div className="card-title">{(formData as any).id ? 'Edit Lead' : 'Add New Lead'}</div>
               <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
             </div>
             <form onSubmit={handleSubmit}>
               {/* Form Fields... Simplified for brevity */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div className="form-group">
                   <label className="form-label">Name *</label>
                   <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input className="form-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Location</label>
                    <input className="form-input" placeholder="e.g. Goa" value={formData.eventLocation} onChange={e => setFormData({...formData, eventLocation: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Rep ID</label>
                    <input className="form-input" type="number" placeholder="User ID" value={formData.assignedToUserId} onChange={e => setFormData({...formData, assignedToUserId: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Existing Client ID</label>
                    <input className="form-input" type="number" placeholder="Optional (Repeat Business)" value={formData.existingClientId} onChange={e => setFormData({...formData, existingClientId: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Event Brief / Requirements</label>
                    <textarea className="form-input" rows={3} placeholder="e.g. 500 pax, beach wedding, vegetarian catering" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                  </div>
                </div>
               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                 <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                 <button type="submit" className="btn btn-primary">Save Lead</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
