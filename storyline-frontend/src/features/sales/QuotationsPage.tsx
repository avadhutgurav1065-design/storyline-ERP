import { useState, useEffect, type FormEvent } from 'react';
import { salesApi, crmApi } from '../../api/client';
import { useSearchParams } from 'react-router-dom';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get('clientId');

  const [formData, setFormData] = useState({
    clientId: initialClientId || '',
    eventName: '',
    eventDate: '',
    pax: '',
    venue: '',
  });

  const fetchClients = async () => {
    try {
      const res = await crmApi.listClients({ size: 100 });
      setClients(res.data.data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      // In a real app we might fetch all quotes, but API requires clientId. 
      // If no clientId is selected, we could fetch all via a different endpoint. 
      // For now, if initialClientId exists, fetch for that client.
      if (initialClientId) {
        const res = await salesApi.listQuotations(Number(initialClientId));
        setQuotations(res.data.data.content);
      } else if (clients.length > 0) {
        // Just fetch for the first client as a placeholder, or implement global search in backend
        const res = await salesApi.listQuotations(clients[0].id);
        setQuotations(res.data.data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      fetchQuotations();
    }
  }, [clients, initialClientId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await salesApi.createQuotation({
        ...formData,
        clientId: Number(formData.clientId),
        pax: formData.pax ? Number(formData.pax) : null,
      });
      setShowModal(false);
      setFormData({ clientId: formData.clientId, eventName: '', eventDate: '', pax: '', venue: '' });
      fetchQuotations();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'badge-warning',
    SENT: 'badge-info',
    REJECTED: 'badge-danger',
    APPROVED: 'badge-success',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">Manage client quotations and pricing</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Quotation</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Quote No.</th>
                <th>Event Details</th>
                <th>Version</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading quotations...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No quotations found</td></tr>
              ) : (
                quotations.map((quote) => (
                  <tr key={quote.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{quote.quoteNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quote.createdAt?.substring(0,10)}</div>
                    </td>
                    <td>
                      <div>{quote.eventName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {quote.eventDate || 'TBD'} • {quote.pax || 0} pax
                      </div>
                    </td>
                    <td>v{quote.version}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>₹{quote.grandTotal?.toLocaleString() || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tax: ₹{quote.taxAmount?.toLocaleString() || 0}</div>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[quote.status]}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" title="Edit/Build">✏️</button>
                        <button className="btn btn-ghost btn-sm" title="Download PDF">📥</button>
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
              <div className="card-title">Create Quotation</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Client *</label>
                <select className="form-select" required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company || 'Individual'})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input className="form-input" required value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} placeholder="e.g. Rahul & Priya Wedding" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input type="date" className="form-input" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Pax</label>
                  <input type="number" className="form-input" value={formData.pax} onChange={e => setFormData({...formData, pax: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Venue</label>
                <input className="form-input" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
