import { useState, useEffect } from 'react';
import { eventsApi, teamAssignmentsApi, lookupsApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function TeamManagementPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<Record<number, any[]>>({});
  const [usersMap, setUsersMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all active events and all users
      const [eventsRes, usersRes] = await Promise.all([
        eventsApi.listEvents({ size: 50, sort: 'startDate,desc' }),
        lookupsApi.users()
      ]);

      const eventsList = eventsRes.data.data.content || [];
      const usersList = usersRes.data.data || [];

      // Create a map of users for fast avatar lookup
      const uMap: Record<number, any> = {};
      usersList.forEach((u: any) => { uMap[u.id] = u; });
      setUsersMap(uMap);
      setEvents(eventsList);

      // Fetch assignments for each event in parallel
      const assignmentsPromises = eventsList.map((ev: any) => teamAssignmentsApi.getByEvent(ev.id).catch(() => ({ data: { data: [] } })));
      const assignmentsResults = await Promise.all(assignmentsPromises);

      const tData: Record<number, any[]> = {};
      eventsList.forEach((ev: any, index: number) => {
        // Handle varying response structures safely
        tData[ev.id] = assignmentsResults[index]?.data?.data || [];
      });

      setTeamData(tData);

    } catch (err) {
      console.error("Error fetching team dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Predefined gradients to keep avatars distinct
  const avatarGradients = [
    'linear-gradient(135deg, #6366f1, #a855f7)',
    'linear-gradient(135deg, #3b82f6, #2dd4bf)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #10b981, #3b82f6)'
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Global Team Dashboard</h1>
          <p className="page-subtitle">Overview of team resource allocation across all active events</p>
        </div>
        <button className="btn btn-outline" onClick={() => fetchDashboardData()}>
          <span style={{ marginRight: '8px' }}>↻</span> Sync Data
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading Team Dashboards...</div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <h3>No active events found.</h3>
          <p>Create an event first to begin assigning team members.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          {events.map(ev => {
            const team = teamData[ev.id] || [];
            
            // Check for critical missing roles
            const hasHead = team.some(t => t.isHead || (t.role && t.role.toUpperCase().includes('HEAD')));
            
            return (
              <div key={ev.id} className="card" style={{ display: 'flex', flexWrap: 'wrap', padding: '24px', gap: '20px', alignItems: 'center' }}>
                
                {/* Event Details Left */}
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>{ev.name}</h2>
                    <span className={`badge ${ev.status === 'CONFIRMED' ? 'badge-success' : 'badge-primary'}`}>{ev.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    🗓 {ev.startDate ? format(new Date(ev.startDate), 'MMM d, yyyy') : 'TBA'} 
                    {ev.location && ` • 📍 ${ev.location}`}
                  </div>
                  
                  {/* Warning Badges */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {team.length === 0 && (
                      <span className="badge badge-warning" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        ⚠️ No Team Assigned
                      </span>
                    )}
                    {team.length > 0 && !hasHead && (
                      <span className="badge badge-warning" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        ⚠️ Missing Event Head
                      </span>
                    )}
                  </div>
                </div>

                {/* Face-pile Avatars Center */}
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px', whiteSpace: 'nowrap' }}>
                    Assigned Team ({team.length})
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {team.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Unassigned</div>
                    ) : (
                      <div style={{ display: 'flex', paddingLeft: '12px' }}>
                        {team.slice(0, 5).map((memberAssignment, idx) => {
                          const user = usersMap[memberAssignment.userId];
                          const name = user ? user.fullName : 'Unknown';
                          const bg = avatarGradients[(memberAssignment.userId || idx) % avatarGradients.length];
                          return (
                            <div 
                              key={idx} 
                              title={`${name} - ${memberAssignment.role}`}
                              style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: bg,
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', fontWeight: 600, border: '2px solid var(--card-bg)',
                                marginLeft: '-12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                cursor: 'pointer', zIndex: 5 - idx, lineHeight: 1
                              }}
                            >
                              {getInitials(name)}
                            </div>
                          )
                        })}
                        {team.length > 5 && (
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)',
                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 600, border: '2px solid var(--card-bg)',
                            marginLeft: '-12px', zIndex: 0
                          }}>
                            +{team.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Right */}
                <div style={{ flex: '0 0 auto' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate(`/events/${ev.id}`)}
                    style={{ padding: '10px 24px', whiteSpace: 'nowrap' }}
                  >
                    Manage Team →
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
