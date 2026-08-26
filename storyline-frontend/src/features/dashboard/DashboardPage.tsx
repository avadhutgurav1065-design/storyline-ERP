import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { crmApi, eventsApi, salesApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Sector 
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<any>({
    totalLeads: 0,
    totalClients: 0,
    totalEvents: 0,
    monthlyRevenue: 0,
    eventCharts: { PLANNING: 0, IN_PROGRESS: 0, COMPLETED: 0 },
    taskCharts: { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 }
  });
  
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For Active Pie Chart
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, leadsRes, eventsRes, quotesRes] = await Promise.all([
          api.get('/dashboard/stats').catch(() => ({ data: { data: {} } })),
          crmApi.listLeads({ size: 4, sort: 'createdAt,desc' }).catch(() => ({ data: { data: { content: [] } } })),
          eventsApi.listEvents({ size: 3, sort: 'startDate,asc', status: 'PLANNING' }).catch(() => ({ data: { data: { content: [] } } })),
          salesApi.listQuotations({ size: 3, sort: 'createdAt,desc' }).catch(() => ({ data: { data: { content: [] } } }))
        ]);
        
        if (statsRes.data && statsRes.data.data) {
          setStats(statsRes.data.data);
        }
        setRecentLeads(leadsRes.data?.data?.content || []);
        setUpcomingEvents(eventsRes.data?.data?.content || []);
        setRecentQuotes(quotesRes.data?.data?.content || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const eventData = [
    { name: 'Planning', value: stats.eventCharts?.PLANNING || 0, color: '#f59e0b' },
    { name: 'In Progress', value: stats.eventCharts?.IN_PROGRESS || 0, color: '#3b82f6' },
    { name: 'Completed', value: stats.eventCharts?.COMPLETED || 0, color: '#10b981' }
  ];

  const taskData = [
    { name: 'Pending', Tasks: stats.taskCharts?.PENDING || 0 },
    { name: 'In Progress', Tasks: stats.taskCharts?.IN_PROGRESS || 0 },
    { name: 'Completed', Tasks: stats.taskCharts?.COMPLETED || 0 }
  ];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    return (
      <g>
        <text x={cx} y={cy} dy={-4} textAnchor="middle" fill={fill} fontSize={18} fontWeight={600}>{payload.name}</text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#64748b" fontSize={14}>{value} Events</text>
        <Sector
          cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
          startAngle={startAngle} endAngle={endAngle} fill={fill}
        />
        <Sector
          cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
          innerRadius={outerRadius + 12} outerRadius={outerRadius + 18} fill={fill}
        />
      </g>
    );
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      {/* 1. Dynamic Greeting & Header */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
        marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' 
      }}>
        <div>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 500 }}>{today}</p>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Good morning, {user?.fullName?.split(' ')[0] || 'Admin'}.
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => window.print()} style={{ background: 'white' }}>
            Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
           <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
           Loading your dashboard...
        </div>
      ) : (
        <>
          {/* 2. Quick Actions */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
              <button onClick={() => navigate('/leads')} className="quick-action-btn">
                <span style={{ fontSize: '1.25rem', background: '#e0e7ff', color: '#4f46e5', padding: '10px', borderRadius: '12px' }}>👥</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Add Lead</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Create a new prospect</div>
                </div>
              </button>
              <button onClick={() => navigate('/quotations')} className="quick-action-btn">
                <span style={{ fontSize: '1.25rem', background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '12px' }}>📝</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>New Quotation</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Draft a sales proposal</div>
                </div>
              </button>
              <button onClick={() => navigate('/events')} className="quick-action-btn">
                <span style={{ fontSize: '1.25rem', background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '12px' }}>📅</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Create Event</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schedule a new event</div>
                </div>
              </button>
              <button onClick={() => navigate('/finance/invoices')} className="quick-action-btn">
                <span style={{ fontSize: '1.25rem', background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '12px' }}>💰</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Issue Invoice</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bill a client</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Premium Stat Cards */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '20px', marginBottom: '32px' 
          }}>
            <div className="stat-card premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-label">Monthly Revenue</div>
                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px', borderRadius: '8px' }}>💸</div>
              </div>
              <div className="stat-value">₹{stats.monthlyRevenue?.toLocaleString() || 0}</div>
              <div className="stat-trend trend-up">Current Month Billings</div>
            </div>
            
            <div className="stat-card premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-label">Active Events</div>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '6px', borderRadius: '8px' }}>🎪</div>
              </div>
              <div className="stat-value">{stats.totalEvents || 0}</div>
              <div className="stat-trend">Across all stages</div>
            </div>

            <div className="stat-card premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-label">Total Leads</div>
                <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '6px', borderRadius: '8px' }}>🎯</div>
              </div>
              <div className="stat-value">{stats.totalLeads || 0}</div>
              <div className="stat-trend trend-up">Potential deals in pipeline</div>
            </div>

            <div className="stat-card premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-label">Converted Clients</div>
                <div style={{ background: '#f3e8ff', color: '#9333ea', padding: '6px', borderRadius: '8px' }}>🤝</div>
              </div>
              <div className="stat-value">{stats.totalClients || 0}</div>
              <div className="stat-trend trend-up">Secured accounts</div>
            </div>
          </div>

          {/* 4. Interactive Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            <div className="card premium-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>Event Pipeline</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Hover to expand stage details</p>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={eventData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      animationBegin={200}
                      animationDuration={800}
                    >
                      {eventData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card premium-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>Task Completion Tracker</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Volume of tasks by status</p>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="Tasks" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 5. Real-time Activity Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            
            {/* Recent Leads */}
            <div className="card premium-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Newest Leads</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentLeads.length === 0 ? (
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No leads found.</div>
                ) : (
                  recentLeads.map(lead => (
                    <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                       <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                          {lead.name.charAt(0)}
                       </div>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{lead.name}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.eventType || 'Unknown Event'} • {lead.status}</div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="card premium-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Upcoming Events</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {upcomingEvents.length === 0 ? (
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming events in planning.</div>
                ) : (
                  upcomingEvents.map(event => (
                    <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                       <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '8px', textAlign: 'center', minWidth: '45px' }}>
                          <div style={{ fontSize: '0.7rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 700 }}>
                             {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e', lineHeight: 1 }}>
                             {new Date(event.startDate).getDate()}
                          </div>
                       </div>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{event.name}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.venue || 'No venue'}</div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Quotations */}
            <div className="card premium-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Quotations</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/quotations')}>View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentQuotes.length === 0 ? (
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent quotations.</div>
                ) : (
                  recentQuotes.map(quote => (
                    <div key={quote.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 500, fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{quote.referenceNumber}</span>
                            <span style={{ color: '#10b981' }}>₹{quote.totalAmount?.toLocaleString() || 0}</span>
                         </div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {quote.status}</div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Global CSS for this dashboard only (injected safely via styled approach or global class) */}
      <style>{`
        .premium-card {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 16px 20px;
          border-radius: 16px;
          min-width: 240px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .quick-action-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
