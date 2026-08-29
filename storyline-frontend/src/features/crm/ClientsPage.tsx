import { useState, useEffect, type FormEvent } from 'react';
import { crmApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import ClientDetailsDrawer from './ClientDetailsDrawer';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', address: '', gstNumber: '', eventType: '', description: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await crmApi.listClients({ search });
      setClients(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.content || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await crmApi.createClient(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', company: '', address: '', gstNumber: '', eventType: '', description: '' });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Management</h1>
          <p className="page-subtitle">Manage your converted clients and billing details</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Client</button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <input
          type="text" className="form-input" placeholder="Search clients by name, email, or company..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="interactive-table">
            <thead>
              <tr style={{ background: 'transparent' }}>
                <th style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Client Name</th>
                <th style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Contact Details</th>
                <th style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Event Type</th>
                <th style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Description / GST</th>
                <th style={{ color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', border: 'none' }}>Loading clients...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', border: 'none' }}>No clients found</td></tr>
              ) : (
                clients.map((client) => {
                  const getAvatarColor = (name: string) => {
                    const colors = [{ bg: '#E0F2FE', text: '#0284C7' }, { bg: '#FEF08A', text: '#854D0E' }, { bg: '#BBF7D0', text: '#166534' }, { bg: '#FCE7F3', text: '#DB2777' }];
                    const index = name.length % colors.length;
                    return colors[index];
                  };
                  const avatarStyle = getAvatarColor(client.name || '');

                  return (
                    <tr key={client.id} className="hover-row" onClick={() => setSelectedClientId(client.id)} style={{ cursor: 'pointer' }}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '12px', border: 'none' }}>
                        <div className="avatar" style={{ background: avatarStyle.bg, color: avatarStyle.text, width: 40, height: 40, fontSize: '0.875rem' }}>
                          {client.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                           <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.name}</div>
                           {client.company && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.company}</div>}
                           {client.assignedToUserId && <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Account Mgr: #{client.assignedToUserId}</div>}
                        </div>
                      </td>
                      <td style={{ border: 'none' }}>
                        <div style={{ fontWeight: 500 }}>{client.phone}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email || '—'}</div>
                      </td>
                      <td style={{ border: 'none' }}>
                        <span className={`badge-pastel ${client.eventType?.toLowerCase().includes('wedding') ? 'purple' : client.eventType?.toLowerCase().includes('corporate') ? 'blue' : 'green'}`}>
                          {client.eventType || 'General'}
                        </span>
                      </td>
                      <td style={{ border: 'none' }}>
                        <div style={{ fontSize: '0.85rem' }}>{client.description || '—'}</div>
                        {client.gstNumber && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GST: {client.gstNumber}</div>}
                      </td>
                      <td style={{ textAlign: 'right', border: 'none' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="badge-pastel green"
                          onClick={(e) => { e.stopPropagation(); navigate(`/quotations?clientId=${client.id}`); }}
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          View Quotes
                        </button>
                        {client.phone && (
                           <a href={`tel:${client.phone}`} className="btn btn-ghost btn-sm" title="Call" onClick={(e) => e.stopPropagation()}>📞</a>
                        )}
                        <button className="btn btn-ghost btn-sm" title="Edit" onClick={(e) => e.stopPropagation()}>✏️</button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Add New Client</div>
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
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Company Name</label>
                  <input className="form-input" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <input className="form-input" value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} placeholder="e.g. Wedding" />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input className="form-input" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description / Notes</label>
                  <textarea className="form-input" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Address</label>
                  <textarea className="form-input" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedClientId && (
        <ClientDetailsDrawer
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
          onUpdate={fetchClients}
        />
      )}
    </div>
  );
}

