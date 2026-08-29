import { useState, useEffect } from 'react';
import { crmApi } from '../../api/client';

interface ClientDetailsDrawerProps {
  clientId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ClientDetailsDrawer({ clientId, onClose, onUpdate }: ClientDetailsDrawerProps) {
  const [client, setClient] = useState<any>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newFollowUp, setNewFollowUp] = useState({
    interactionType: 'CALL',
    discussion: '',
    nextSteps: '',
    nextFollowUpDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const clientRes = await crmApi.getClient(clientId);
      const clientData = clientRes.data.data;
      setClient(clientData);

      // Fetch client follow ups (Backend now merges lead history natively)
      const clientFollowUpsRes = await crmApi.getClientFollowUps(clientId).catch(() => ({ data: { data: [] } }));
      setFollowUps(clientFollowUpsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUp.discussion.trim()) return;
    
    setIsSubmitting(true);
    
    let formattedNotes = newFollowUp.discussion.trim();

    try {
      await crmApi.createFollowUp({
        clientId,
        interactionType: newFollowUp.interactionType,
        notes: formattedNotes,
        nextSteps: newFollowUp.nextSteps.trim(),
        nextFollowUpDate: newFollowUp.nextFollowUpDate ? new Date(newFollowUp.nextFollowUpDate).toISOString() : null,
        performedByUserId: 1 
      });
      
      setNewFollowUp({ interactionType: 'CALL', discussion: '', nextSteps: '', nextFollowUpDate: '' });
      fetchClientData(); // Refresh everything
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOpportunity = async () => {
    setIsCreatingOpportunity(true);
    try {
      await crmApi.createLead({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        existingClientId: client.id,
        requirements: 'New Inquiry from existing client'
      });
      alert('New opportunity (Lead) successfully created on the Kanban board!');
    } catch (err) {
      console.error('Failed to create opportunity', err);
      alert('Failed to create opportunity.');
    } finally {
      setIsCreatingOpportunity(false);
    }
  };

  if (!client && !loading) {
    return (
      <div className="drawer-overlay" onClick={onClose}>
        <div className="drawer-content" onClick={e => e.stopPropagation()}>
           <div className="p-6">Client not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={onClose}>
      <div 
        style={{ width: '600px', backgroundColor: 'var(--bg-card)', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)' }}
        onClick={e => e.stopPropagation()}
        className="animate-slide-in-right"
      >
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading details...</div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{client.name}</h2>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>CLIENT</span>
                </div>
                {client.company && <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{client.company}</p>}
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                   {client.phone && (
                     <a href={`tel:${client.phone}`} className="btn btn-sm" style={{ backgroundColor: '#25D366', color: 'white' }}>
                       📞 Call
                     </a>
                   )}
                   {client.email && (
                     <a href={`mailto:${client.email}`} className="btn btn-sm btn-secondary">
                       ✉️ Email
                     </a>
                   )}
                   <button className="btn btn-sm btn-primary" onClick={handleCreateOpportunity} disabled={isCreatingOpportunity}>
                     {isCreatingOpportunity ? 'Creating...' : '+ New Opportunity'}
                   </button>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
            </div>

            {/* Main Content */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Client Details Grid */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600 }}>Client Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '8px' }}>
                   <div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</div>
                     <div style={{ fontWeight: 500 }}>{client.phone || '—'}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div>
                     <div style={{ fontWeight: 500 }}>{client.email || '—'}</div>
                   </div>
                   <div style={{ gridColumn: '1 / -1' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</div>
                     <div style={{ fontWeight: 500 }}>{client.address || '—'}</div>
                   </div>
                   <div style={{ gridColumn: '1 / -1' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GST Number</div>
                     <div style={{ fontWeight: 500 }}>{client.gstNumber || '—'}</div>
                   </div>
                </div>
              </div>

              {/* Follow ups */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>Activity & Follow-ups</h4>
                
                {/* Advanced Form */}
                <form onSubmit={handleAddFollowUp} style={{ backgroundColor: 'var(--bg-main)', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px', marginBottom: '16px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Type</label>
                      <select 
                        className="form-select" 
                        value={newFollowUp.interactionType}
                        onChange={e => setNewFollowUp({...newFollowUp, interactionType: e.target.value})}
                      >
                        <option value="CALL">Call</option>
                        <option value="EMAIL">Email</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="MEETING">Meeting</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>What was discussed?</label>
                      <textarea 
                        className="form-input" 
                        placeholder="Log notes about this interaction..."
                        value={newFollowUp.discussion}
                        onChange={e => setNewFollowUp({...newFollowUp, discussion: e.target.value})}
                        required
                        style={{ resize: 'vertical', minHeight: '60px' }}
                      />
                    </div>

                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Next Steps / Meeting Agenda</label>
                      <input 
                        type="text"
                        className="form-input" 
                        placeholder="What to discuss next time..."
                        value={newFollowUp.nextSteps}
                        onChange={e => setNewFollowUp({...newFollowUp, nextSteps: e.target.value})}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Schedule Next Contact</label>
                      <input 
                        type="datetime-local"
                        className="form-input" 
                        value={newFollowUp.nextFollowUpDate}
                        onChange={e => setNewFollowUp({...newFollowUp, nextFollowUpDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Log Activity'}
                    </button>
                  </div>
                </form>

                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {followUps.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No activity logged yet.</div>
                  ) : (
                    followUps.map(fu => (
                      <div key={fu.id} style={{ display: 'flex', gap: '16px' }}>
                         <div style={{ 
                            width: '40px', height: '40px', borderRadius: '50%', 
                            backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                         }}>
                            {fu.interactionType === 'CALL' ? '📞' : 
                             fu.interactionType === 'EMAIL' ? '✉️' : 
                             fu.interactionType === 'WHATSAPP' ? '💬' : 
                             fu.interactionType === 'MEETING' ? '🤝' : '📝'}
                         </div>
                         <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{fu.interactionType}</span>
                                {fu.leadId && !fu.clientId && (
                                  <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>PRE-CONVERSION</span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(fu.interactionDate).toLocaleString()}
                              </span>
                            </div>
                            
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-color)', whiteSpace: 'pre-wrap' }}>
                                {fu.notes}
                            </div>

                            {fu.nextFollowUpDate && (
                              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', fontSize: '0.8rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 🗓️ Scheduled Next: {new Date(fu.nextFollowUpDate).toLocaleString()}
                              </div>
                            )}
                         </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

