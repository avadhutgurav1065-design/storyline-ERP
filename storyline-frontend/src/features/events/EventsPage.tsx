import { useState, useEffect, type FormEvent } from 'react';
import { eventsApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    venue: '',
    pax: '',
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.listEvents();
      setEvents(res.data.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await eventsApi.createEvent({
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        pax: formData.pax ? Number(formData.pax) : null,
      });
      setShowModal(false);
      setFormData({ name: '', startDate: '', endDate: '', venue: '', pax: '' });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<string, string> = {
    PLANNING: 'badge-warning',
    CONFIRMED: 'badge-info',
    IN_PROGRESS: 'badge-primary',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Events Board</h1>
          <p className="page-subtitle">Track and manage event operations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Event</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>No events found</div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{evt.name}</h3>
                <span className={`badge ${statusColors[evt.status]}`}>{evt.status}</span>
              </div>
              
              <div style={{ marginBottom: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '8px' }}>📅 {evt.startDate || 'TBD'} to {evt.endDate || 'TBD'}</div>
                <div style={{ marginBottom: '8px' }}>📍 {evt.venue || 'TBD'}</div>
                <div>👥 {evt.pax || 0} pax</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span>{evt.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${evt.progress}%`, height: '100%', background: 'var(--primary-500)', transition: 'width 0.3s' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.875rem' }} onClick={() => navigate(`/events/${evt.id}?tab=CHECKLIST`)}>View Tasks</button>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.875rem' }} onClick={() => navigate(`/events/${evt.id}?tab=TEAM`)}>Team & Vendors</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Create New Event</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Corporate Gala 2026" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input className="form-input" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Pax</label>
                  <input type="number" className="form-input" value={formData.pax} onChange={e => setFormData({...formData, pax: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

