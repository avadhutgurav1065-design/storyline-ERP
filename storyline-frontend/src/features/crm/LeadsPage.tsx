import { useState, useEffect, type FormEvent } from 'react';
import { crmApi } from '../../api/client';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    eventType: '', budget: '', source: '',
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await crmApi.listLeads({ search, status: statusFilter });
      setLeads(res.data.data.content);
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
    }
  };

  const handleConvert = async (e: FormEvent) => {
    e.preventDefault();
    if (!showConvertModal) return;
    try {
      // Basic conversion without extra data for now
      await crmApi.convertLead(showConvertModal, {});
      setShowConvertModal(null);
      fetchLeads();
    } catch (err) {
      console.error(err);
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
          type="text" className="form-input" placeholder="Search leads..."
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
          <table>
            <thead>
              <tr>
                <th>Name / Company</th>
                <th>Contact</th>
                <th>Event Type</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No leads found</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{lead.name}</div>
                      {lead.company && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.company}</div>}
                    </td>
                    <td>
                      <div>{lead.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.email}</div>
                    </td>
                    <td>{lead.eventType || '—'}</td>
                    <td>{lead.budget ? `₹${lead.budget.toLocaleString()}` : '—'}</td>
                    <td>
                      <span className={`badge ${statusColors[lead.status] || 'badge-primary'}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          title="Edit"
                          onClick={() => {
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
                        {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
                          <button
                            className="btn btn-success btn-sm"
                            title="Convert to Client"
                            onClick={() => setShowConvertModal(lead.id)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Convert
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">Add New Lead</div>
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
                  <label className="form-label">Estimated Budget</label>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '16px' }}>Convert to Client?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.875rem' }}>
              This will mark the lead as CONVERTED and create a new Client record. You can edit the client's GST and billing address later.
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
