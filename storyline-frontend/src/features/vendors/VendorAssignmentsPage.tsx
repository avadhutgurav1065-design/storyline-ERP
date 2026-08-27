import { useState, useEffect } from 'react';
import { eventsApi, vendorAssignmentsApi, vendorsApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function VendorAssignmentsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [vendorData, setVendorData] = useState<Record<number, any[]>>({});
  const [vendorsMap, setVendorsMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all active events and all vendors
      const [eventsRes, vendorsRes] = await Promise.all([
        eventsApi.listEvents({ size: 50, sort: 'startDate,desc' }),
        vendorsApi.list()
      ]);

      const eventsList = eventsRes.data.data.content || [];
      const vendorsList = vendorsRes.data.data || [];

      // Create a map of vendors for fast lookup
      const vMap: Record<number, any> = {};
      vendorsList.forEach((v: any) => { vMap[v.id] = v; });
      setVendorsMap(vMap);
      setEvents(eventsList);

      // Fetch assignments for each event in parallel
      const assignmentsPromises = eventsList.map((ev: any) => vendorAssignmentsApi.getByEvent(ev.id).catch(() => ({ data: { data: [] } })));
      const assignmentsResults = await Promise.all(assignmentsPromises);

      const vData: Record<number, any[]> = {};
      eventsList.forEach((ev: any, index: number) => {
        // Handle varying response structures safely
        vData[ev.id] = assignmentsResults[index]?.data?.data || [];
      });

      setVendorData(vData);

    } catch (err) {
      console.error("Error fetching vendor dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'V';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Global Vendor Dashboard</h1>
          <p className="page-subtitle">Overview of vendor assignments and external costs across all active events</p>
        </div>
        <button className="btn btn-outline" onClick={() => fetchDashboardData()}>
          <span style={{ marginRight: '8px' }}>↻</span> Sync Data
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading Vendor Dashboards...</div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <h3>No active events found.</h3>
          <p>Create an event first to begin assigning vendors.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          {events.map(ev => {
            const assignments = vendorData[ev.id] || [];
            
            // Calculate total event vendor costs
            const totalCost = assignments.reduce((sum, a) => sum + (Number(a.agreedAmount) || 0), 0);
            
            return (
              <div key={ev.id} className="card" style={{ display: 'flex', padding: '24px', gap: '24px', alignItems: 'center' }}>
                
                {/* Event Details Left */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{ev.name}</h2>
                    <span className={`badge ${ev.status === 'CONFIRMED' ? 'badge-success' : 'badge-primary'}`}>{ev.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    🗓 {ev.startDate ? format(new Date(ev.startDate), 'MMM d, yyyy') : 'TBA'} 
                    {ev.location && ` • 📍 ${ev.location}`}
                  </div>
                  
                  {/* Warning Badges */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    {assignments.length === 0 && (
                      <span className="badge badge-warning" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        ⚠️ No Vendors Assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Assignments & Cost Center */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '0 20px' }}>
                  <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}>
                    Assigned Vendors ({assignments.length})
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    {assignments.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Unassigned</div>
                    ) : (
                      <div style={{ display: 'flex', paddingLeft: '12px' }}>
                        {assignments.slice(0, 5).map((a, idx) => {
                          const vendor = a.vendor || vendorsMap[a.vendorId];
                          const name = vendor ? vendor.name : 'Unknown Vendor';
                          return (
                            <div 
                              key={idx} 
                              title={`${name} - ${a.task} - $${a.agreedAmount}`}
                              style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-500)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', fontWeight: 600, border: '2px solid var(--card-bg)',
                                marginLeft: '-12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                cursor: 'pointer', zIndex: 5 - idx
                              }}
                            >
                              {getInitials(name)}
                            </div>
                          )
                        })}
                        {assignments.length > 5 && (
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)',
                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 600, border: '2px solid var(--card-bg)',
                            marginLeft: '-12px', zIndex: 0
                          }}>
                            +{assignments.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {assignments.length > 0 && (
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>
                      Total Vendor Cost: <span style={{ color: '#10b981' }}>${totalCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Actions Right */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate(`/events/${ev.id}`)}
                    style={{ padding: '10px 24px' }}
                  >
                    Manage Vendors →
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
