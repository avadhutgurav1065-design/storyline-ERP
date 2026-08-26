import { useState, useEffect, type FormEvent } from 'react';
import { crmApi } from '../../api/client';
import LeadDetailsDrawer from './LeadDetailsDrawer';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<number | null>(null);
  
  // Drawer state
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    eventType: '', budget: '', source: '',
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await crmApi.listLeads({ search, status: statusFilter });
      setLeads(res.data.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if ((formData as any).id) {
        await crmApi.updateLead((formData as any).id, {
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        });
      } else {
        await crmApi.createLead({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        });
      }
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', company: '', eventType: '', budget: '', source: '' } as any);
      fetchLeads();
    } catch (err) {
      console.error(err);
      alert('Failed to save lead. Please check the inputs.');
    }
  };

  const handleConvert = async (e: FormEvent) => {
    e.preventDefault();
    if (!showConvertModal) return;
    const targetId = showConvertModal;
    
    // Optimistic update
    const previousLeads = [...leads];
    setLeads(leads.map(l => l.id === targetId ? { ...l, status: 'CONVERTED' } : l));
    setShowConvertModal(null);

    try {
      await crmApi.convertLead(targetId, {});
    } catch (err) {
      console.error(err);
      setLeads(previousLeads);
      alert('Failed to convert lead. They might already be converted.');
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      const previousLeads = [...leads];
      setLeads(leads.filter(l => l.id !== id));
      try {
        await crmApi.deleteLead(id);
      } catch (err) {
        console.error(err);
        setLeads(previousLeads);
        alert('Failed to delete lead.');
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string, e?: React.ChangeEvent<HTMLSelectElement>) => {
    if (e) e.stopPropagation();
    
    // Optimistic UI update
    const previousLeads = [...leads];
    setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));

    try {
      if (newStatus === 'CONVERTED') {
         await crmApi.convertLead(id, {});
      } else {
         const lead = previousLeads.find(l => l.id === id);
         if (lead) await crmApi.updateLead(id, { ...lead, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      setLeads(previousLeads);
      alert('Failed to update status.');
    }
  };

  const statusColors: Record<string, string> = {
    NEW: 'badge-info',
    CONTACTED: 'badge-warning',
    QUALIFIED: 'badge-primary',
    PROPOSAL_SENT: 'badge-primary',
    CONVERTED: 'badge-success',
    LOST: 'badge-danger',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Management</h1>
          <p className="page-subtitle">Track and convert prospective event clients</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Lead</button>
      </div>

      <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
        <input
          type="text" className="form-input" placeholder="Search leads by name, company, email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: '400px' }}
        />
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="PROPOSAL_SENT">Proposal Sent</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="interactive-table">
            <thead>
              <tr>
                <th>Lead Info</th>
                <th>Contact</th>
                <th>Event Type</th>
                <th>Budget</th>
                <th>Pipeline Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No leads found</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLeadId(lead.id)}
                    style={{ cursor: 'pointer' }}
                    className="hover-row"
                  >
                    <td data-label="Lead Info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            width: '40px', height: '40px', borderRadius: '8px', 
                            backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                        }}>
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{lead.name}</div>
                          {lead.company && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.company}</div>}
                        </div>
                      </div>
                    </td>
                    <td data-label="Contact">
                      <div style={{ fontWeight: 500 }}>{lead.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.email || 'No email'}</div>
                    </td>
                    <td data-label="Event Type">
                      <span style={{ padding: '4px 8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {lead.eventType || 'Unspecified'}
                      </span>
                    </td>
                    <td data-label="Budget">
                      {lead.budget ? <strong style={{ color: 'var(--primary-color)' }}>₹{lead.budget.toLocaleString()}</strong> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td data-label="Pipeline Status" onClick={e => e.stopPropagation()}>
                       <select 
                          className="form-select" 
                          style={{ 
                            padding: '4px 8px', fontSize: '0.75rem', 
                            backgroundColor: lead.status === 'LOST' ? '#fee2e2' : lead.status === 'CONVERTED' ? '#dcfce7' : 'var(--bg-main)',
                            border: 'none',
                            fontWeight: 600
                          }}
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value, e)}
                       >
                         <option value="NEW">NEW</option>
                         <option value="CONTACTED">CONTACTED</option>
                         <option value="QUALIFIED">QUALIFIED</option>
                         <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                         <option value="CONVERTED">CONVERTED (Client)</option>
                         <option value="LOST">LOST (Rejected)</option>
                       </select>
                    </td>
                    <td data-label="Actions" style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        
                        {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
                          <button
                            className="btn btn-success btn-sm"
                            title="Convert to Client"
                            onClick={(e) => { e.stopPropagation(); setShowConvertModal(lead.id); }}
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Convert
                          </button>
                        )}
                        
                        <button 
                          className="btn btn-ghost btn-sm" 
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({
                              id: lead.id,
                              name: lead.name,
                              email: lead.email || '',
                              phone: lead.phone,
                              company: lead.company || '',
                              eventType: lead.eventType || '',
                              budget: lead.budget || '',
                              source: lead.source || ''
                            } as any);
                            setShowModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        
                        <button 
                          className="btn btn-ghost btn-sm" 
                          title="Delete"
                          style={{ color: '#ef4444' }}
                          onClick={(e) => handleDelete(lead.id, e)}
                        >
                          🗑️
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selectedLeadId && (
        <LeadDetailsDrawer
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={(id, newStatus) => {
            if (id && newStatus) {
               setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
            } else {
               fetchLeads();
            }
          }}
        />
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowModal(false)}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-title">{(formData as any).id ? 'Edit Lead' : 'Add New Lead'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
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
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <input className="form-input" placeholder="e.g. Corporate, Wedding" value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Budget (₹)</label>
                  <input type="number" className="form-input" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
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

      {/* Convert Modal */}
      {showConvertModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowConvertModal(null)}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>Convert to Client?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.875rem' }}>
              This will mark the lead as CONVERTED and create a new Client record. You can edit the client's GST and billing address later in the Clients tab.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowConvertModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleConvert}>Confirm Conversion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
