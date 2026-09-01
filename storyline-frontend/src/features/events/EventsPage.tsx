import { useState, useEffect, type FormEvent } from 'react';
import { eventsApi, crmApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Calendar, Users, MapPin, CheckCircle } from 'lucide-react';

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    startDate: '',
    endDate: '',
    venue: '',
    pax: '',
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const [res, clientsRes] = await Promise.all([
        eventsApi.listEvents(),
        crmApi.listClients({ size: 100 })
      ]);
      setEvents(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.content || []));
      setClients(Array.isArray(clientsRes.data.data) ? clientsRes.data.data : (clientsRes.data.data?.content || []));
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
      if ((formData as any).id) {
        await eventsApi.updateEvent((formData as any).id, {
          ...formData,
          clientId: formData.clientId ? Number(formData.clientId) : null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          pax: formData.pax ? Number(formData.pax) : null,
        });
      } else {
        await eventsApi.createEvent({
          ...formData,
          clientId: formData.clientId ? Number(formData.clientId) : null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          pax: formData.pax ? Number(formData.pax) : null,
        });
      }
      setShowModal(false);
      setFormData({ name: '', clientId: '', startDate: '', endDate: '', venue: '', pax: '' });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PLANNING': return 'blue';
      case 'CONFIRMED': return 'yellow';
      case 'IN_PROGRESS': return 'orange';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getStatusChartData = () => {
    const counts = events.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    
    return [
      { name: 'Planning', value: counts.PLANNING || 0, color: '#3B82F6' },
      { name: 'Confirmed', value: counts.CONFIRMED || 0, color: '#F59E0B' },
      { name: 'In Progress', value: counts.IN_PROGRESS || 0, color: '#F97316' },
      { name: 'Completed', value: counts.COMPLETED || 0, color: '#10B981' }
    ].filter(d => d.value > 0);
  };

  const chartData = getStatusChartData();

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Events Board</h1>
          <p className="page-subtitle">Track and manage event operations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Event</button>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Event Status Breakdown</h3>
          <div style={{ height: '200px', width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No data available</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px', color: '#0284C7' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Total Active Events</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{events.length}</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#DCFCE7', borderRadius: '12px', color: '#16A34A' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Completed this month</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{events.filter(e => e.status === 'COMPLETED').length}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>No events found</div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onClick={() => navigate(`/events/${evt.id}`)} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span className={`badge-pastel ${getStatusColor(evt.status)}`}>{evt.status}</span>
              </div>
              
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 600 }}>{evt.name}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} /> {new Date(evt.startDate).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} /> {evt.venue || 'TBD'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={14} /> {evt.pax || 0} Expected Pax
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', fontWeight: 500 }}>
                  <span>Progress</span>
                  <span style={{ color: 'var(--text-muted)' }}>{evt.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--gray-100)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${evt.progress}%`, height: '100%', background: '#3B82F6', transition: 'width 0.5s ease-out' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button className="btn btn-ghost" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); setFormData({ ...(evt as any), startDate: evt.startDate || '', endDate: evt.endDate || '' }); setShowModal(true); }}>Edit</button>
                <button className="btn btn-ghost" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); navigate(`/events/${evt.id}?tab=CHECKLIST`); }}>Tasks</button>
                <button className="btn btn-ghost" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); navigate(`/events/${evt.id}?tab=TEAM`); }}>Team</button>
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
              <div className="card-title">{(formData as any).id ? 'Edit Event' : 'Create New Event'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Corporate Gala 2026" />
              </div>
              <div className="form-group">
                <label className="form-label">Client (Optional)</label>
                <select className="form-input" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                  <option value="">Select a Client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
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
                <button type="submit" className="btn btn-primary">{(formData as any).id ? 'Update Event' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

