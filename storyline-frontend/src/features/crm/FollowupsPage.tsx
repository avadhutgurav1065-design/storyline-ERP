import { useState, useEffect, type FormEvent } from 'react';
import api from '../../api/client';
import LeadDetailsDrawer from './LeadDetailsDrawer';
import ClientDetailsDrawer from './ClientDetailsDrawer';

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    leadId: '',
    clientId: '',
    interactionType: 'CALL',
    notes: '',
    nextSteps: '',
    interactionDate: '',
    nextFollowUpDate: ''
  });

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      // The API endpoints we need
      const [fuRes, leadsRes, clientsRes] = await Promise.all([
        api.get('/crm/follow-ups'),
        api.get('/crm/leads?size=500'),
        api.get('/crm/clients?size=500')
      ]);
      
      if (fuRes.data?.data) {
        setFollowups(fuRes.data.data);
      }
      if (leadsRes.data?.data?.content) {
        setLeads(leadsRes.data.data.content);
      }
      if (clientsRes.data?.data?.content) {
        setClients(clientsRes.data.data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/follow-ups', {
        ...formData,
        leadId: formData.leadId ? Number(formData.leadId) : null,
        clientId: formData.clientId ? Number(formData.clientId) : null,
        interactionDate: formData.interactionDate || new Date().toISOString(),
        nextFollowUpDate: formData.nextFollowUpDate || null
      });
      setShowModal(false);
      setFormData({ leadId: '', clientId: '', interactionType: 'CALL', notes: '', nextSteps: '', interactionDate: '', nextFollowUpDate: '' });
      fetchFollowups();
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALL': return '📞';
      case 'EMAIL': return '✉️';
      case 'MEETING': return '🤝';
      case 'WHATSAPP': return '💬';
      default: return '📝';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-ups Calendar</h1>
          <p className="page-subtitle">Schedule and track follow-ups with leads and clients</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Interaction</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Client/Lead Name</th>
                <th>Event Type</th>
                <th>Notes</th>
                <th>Next Discussion Note</th>
                <th>Interaction Date</th>
                <th>Next Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading follow-ups...</td></tr>
              ) : followups.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No follow-ups logged yet</td></tr>
              ) : (
                followups.map((fu) => (
                  <tr 
                    key={fu.id} 
                    className="hover-row"
                    onClick={() => {
                      if (fu.leadId) {
                        setSelectedLeadId(fu.leadId);
                      } else if (fu.clientId) {
                        setSelectedClientId(fu.clientId);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{getTypeIcon(fu.interactionType)}</span>
                        <span>{fu.interactionType}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{fu.targetName || '—'}</div>
                      <div style={{ fontSize: '0.7rem', display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {fu.leadId ? <span className="badge badge-info" style={{ padding: '2px 4px' }}>LEAD</span> : ''}
                        {fu.clientId ? <span className="badge badge-success" style={{ padding: '2px 4px' }}>CLIENT</span> : ''}
                      </div>
                    </td>
                    <td>{fu.eventType || '—'}</td>
                    <td>{fu.notes}</td>
                    <td><div style={{ color: 'var(--text-muted)' }}>{fu.nextSteps || '—'}</div></td>
                    <td>{new Date(fu.interactionDate).toLocaleString()}</td>
                    <td>
                      {fu.nextFollowUpDate ? (
                        <div style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                          {new Date(fu.nextFollowUpDate).toLocaleString()}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Log Follow-up / Interaction</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Select Lead (Optional)</label>
                  <select className="form-select" value={formData.leadId} onChange={e => setFormData({...formData, leadId: e.target.value, clientId: ''})}>
                    <option value="">-- None --</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name} {l.eventType ? `(${l.eventType})` : ''}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Client (Optional)</label>
                  <select className="form-select" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value, leadId: ''})}>
                    <option value="">-- None --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.eventType ? `(${c.eventType})` : ''}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Interaction Type *</label>
                <select className="form-select" required value={formData.interactionType} onChange={e => setFormData({...formData, interactionType: e.target.value})}>
                  <option value="CALL">Call 📞</option>
                  <option value="EMAIL">Email ✉️</option>
                  <option value="MEETING">Meeting 🤝</option>
                  <option value="WHATSAPP">WhatsApp 💬</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Summary *</label>
                <textarea className="form-input" required rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="What was discussed?" />
              </div>

              <div className="form-group">
                <label className="form-label">Next Discussion Note</label>
                <textarea className="form-input" rows={2} value={formData.nextSteps} onChange={e => setFormData({...formData, nextSteps: e.target.value})} placeholder="What to discuss next time?" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date Performed *</label>
                  <input type="datetime-local" className="form-input" value={formData.interactionDate} onChange={e => setFormData({...formData, interactionDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Next Scheduled Follow-up</label>
                  <input type="datetime-local" className="form-input" value={formData.nextFollowUpDate} onChange={e => setFormData({...formData, nextFollowUpDate: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedLeadId && (
        <LeadDetailsDrawer
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={fetchFollowups}
        />
      )}

      {selectedClientId && (
        <ClientDetailsDrawer
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
          onUpdate={fetchFollowups}
        />
      )}
    </div>
  );
}



