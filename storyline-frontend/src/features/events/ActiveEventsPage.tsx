import { useState, useEffect } from 'react';
import { eventsApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';

export default function ActiveEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.listEvents();
      const allEvents = res.data.data.content || [];
      // Only show events that are not COMPLETED or CANCELLED
      setEvents(allEvents.filter((e: any) => e.status !== 'COMPLETED' && e.status !== 'CANCELLED'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Active Events</h1>
          <p className="page-subtitle">Monitor and manage ongoing event preparations</p>
        </div>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center' }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center' }}>No active events found</div>
        ) : (
          events.map(event => (
            <div key={event.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="badge badge-primary">{event.status}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{event.startDate || 'TBD'}</span>
              </div>
              <h3 style={{ margin: '0 0 10px 0' }}>{event.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '15px' }}>
                📍 {event.venue || 'Venue TBD'} <br />
                👥 {event.pax || 0} Pax
              </p>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                  <span>Progress</span>
                  <span>{event.progress}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--bg-secondary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${event.progress}%`, backgroundColor: 'var(--primary-500)', height: '100%' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/events/${event.id}`)}>
                  View Control Center
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
