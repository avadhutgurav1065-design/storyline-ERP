import { useState, useEffect } from 'react';
import { crmApi } from '../../api/client';

interface LeadDetailsDrawerProps {
  leadId: number;
  onClose: () => void;
  onUpdate: (leadId?: number, newStatus?: string) => void;
}

export default function LeadDetailsDrawer({ leadId, onClose, onUpdate }: LeadDetailsDrawerProps) {
  const [lead, setLead] = useState<any>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newFollowUp, setNewFollowUp] = useState({
    interactionType: 'CALL',
    discussion: '',
    nextSteps: '',
    nextFollowUpDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLeadData();
  }, [leadId]);

  const fetchLeadData = async () => {
    setLoading(true);
    try {
      const [leadRes, followUpsRes] = await Promise.all([
        crmApi.getLead(leadId),
        crmApi.getLeadFollowUps(leadId)
      ]);
      setLead(leadRes.data.data);
      setFollowUps(followUpsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // Optimistic UI update to prevent lag
    const updatedLead = { ...lead, status: newStatus };
    setLead(updatedLead);
    
    // Tell parent to update optimistically without waiting for server
    onUpdate(leadId, newStatus);
    
    try {
      if (newStatus === 'CONVERTED') {
        // Automatically create client record via convert API
        await crmApi.convertLead(leadId, {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          address: '',
          gstNumber: ''
        });
      } else {
        await crmApi.updateLead(leadId, updatedLead);
      }
    } catch (err) {
      console.error('Failed to update status', err);
      // If it fails, we might want to revert the state, but we'll keep it simple for now
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUp.discussion.trim()) return;
    
    setIsSubmitting(true);
    
    let formattedNotes = newFollowUp.discussion.trim();

    try {
      await crmApi.createFollowUp({
        leadId,
        interactionType: newFollowUp.interactionType,
        notes: formattedNotes,
        nextSteps: newFollowUp.nextSteps.trim(),
        nextFollowUpDate: newFollowUp.nextFollowUpDate ? new Date(newFollowUp.nextFollowUpDate).toISOString() : null,
        performedByUserId: 1 
      });
      
      setNewFollowUp({ interactionType: 'CALL', discussion: '', nextSteps: '', nextFollowUpDate: '' });
      
      // Refresh follow ups
      const followUpsRes = await crmApi.getLeadFollowUps(leadId);
      setFollowUps(followUpsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead && !loading) {
    return (
      <div className="drawer-overlay" onClick={onClose}>
        <div className="drawer-content" onClick={e => e.stopPropagation()}>
           <div className="p-6">Lead not found.</div>
        </div>
      </div>
    );
  }

  const pipelineStages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED'];
  const isLost = lead?.status === 'LOST';

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
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{lead.name}</h2>
                {lead.company && <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{lead.company}</p>}
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                   {lead.phone && (
                     <a href={`tel:${lead.phone}`} className="btn btn-sm" style={{ backgroundColor: '#25D366', color: 'white' }}>
                       📞 Call
                     </a>
                   )}
                   {lead.email && (
                     <a href={`mailto:${lead.email}`} className="btn btn-sm btn-secondary">
                       ✉️ Email
                     </a>
                   )}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
            </div>

            {/* Pipeline status */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status Pipeline</h4>
              
              {isLost ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-danger" style={{ fontSize: '1rem', padding: '8px 16px' }}>LOST (Deal Rejected)</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange('CONTACTED')}>Reopen Lead</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {pipelineStages.map((stage, idx) => {
                    const currentIndex = pipelineStages.indexOf(lead.status);
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    
                    let bgColor = 'var(--bg-card)';
                    let color = 'var(--text-muted)';
                    let border = '1px solid var(--border-color)';
                    
                    if (isCompleted) {
                      bgColor = 'var(--primary-color)';
                      color = 'white';
                      border = '1px solid var(--primary-color)';
                    } else if (isCurrent) {
                      bgColor = 'rgba(79, 70, 229, 0.1)';
                      color = 'var(--primary-color)';
                      border = '2px solid var(--primary-color)';
                    }
                    
                    return (
                      <button 
                        key={stage}
                        onClick={() => handleStatusChange(stage)}
                        style={{ 
                          flex: 1, 
                          padding: '10px 8px', 
                          borderRadius: '6px', 
                          border, 
                          backgroundColor: bgColor, 
                          color,
                          fontSize: '0.75rem',
                          fontWeight: isCurrent ? 600 : 400,
                          cursor: 'pointer',
                          textAlign: 'center',
                          minWidth: '90px'
                        }}
                      >
                        {stage.replace('_', ' ')}
                      </button>
                    )
                  })}
                  <button 
                     onClick={() => handleStatusChange('LOST')}
                     style={{ 
                          padding: '10px 8px', 
                          borderRadius: '6px', 
                          border: '1px solid #ef4444', 
                          backgroundColor: 'transparent', 
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          marginLeft: '8px'
                     }}
                  >
                    MARK LOST
                  </button>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Lead Details Grid */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600 }}>Lead Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '8px' }}>
                   <div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</div>
                     <div style={{ fontWeight: 500 }}>{lead.phone || '—'}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div>
                     <div style={{ fontWeight: 500 }}>{lead.email || '—'}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event Type</div>
                     <div style={{ fontWeight: 500 }}>{lead.eventType || '—'}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget</div>
                     <div style={{ fontWeight: 500 }}>{lead.budget ? '₹' + lead.budget.toLocaleString() : '—'}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source</div>
                     <div style={{ fontWeight: 500 }}>{lead.source || '—'}</div>
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
                              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{fu.interactionType}</span>
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

