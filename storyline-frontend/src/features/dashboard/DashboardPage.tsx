import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { crmApi, eventsApi, salesApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Sector,
  LineChart, Line
} from 'recharts';

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const hasFinanceAccess = hasRole('ADMIN') || hasRole('FINANCE_MANAGER');
  const hasCrmAccess = hasRole('ADMIN') || hasRole('EVENT_MANAGER');
  
  const [stats, setStats] = useState<any>({
    totalLeads: 0,
    totalClients: 0,
    totalEvents: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    leadsGrowth: 0,
    clientsGrowth: 0,
    revenueTrend: [],
    eventCharts: { PLANNING: 0, IN_PROGRESS: 0, COMPLETED: 0 },
    taskCharts: { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, OVERDUE: 0 }
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
    { name: 'Overdue', Tasks: stats.taskCharts?.OVERDUE || 0 },
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
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17 || hour < 4) greeting = 'Good evening';

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
            {greeting}, {user?.fullName?.split(' ')[0] || 'Admin'}.
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => window.print()} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
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
          {(hasRole('ADMIN') || hasRole('EVENT_MANAGER') || hasRole('FINANCE_MANAGER') || hasRole('EVENT_HEAD')) && (
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
        <div className="animate-fade-in" style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '20px', marginBottom: '32px' 
        }}>
            {hasFinanceAccess && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <span>Monthly Revenue</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>₹{((stats.monthlyRevenue || 0)/1000).toFixed(1)}k</div>
                  <span className={`badge-pastel ${stats.revenueGrowth >= 0 ? 'green' : 'red'}`} style={{ marginBottom: '4px' }}>
                    {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth?.toFixed(1) || 0}% {stats.revenueGrowth >= 0 ? '↑' : '↓'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <span>Active Events</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalEvents || 0}</div>
                <span className="badge-pastel orange" style={{ marginBottom: '4px' }}>Ongoing</span>
              </div>
            </div>

            {hasCrmAccess && (
              <>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <span>Total Leads</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalLeads || 0}</div>
                    <span className={`badge-pastel ${stats.leadsGrowth >= 0 ? 'blue' : 'gray'}`} style={{ marginBottom: '4px' }}>
                      {stats.leadsGrowth > 0 ? '+' : ''}{stats.leadsGrowth?.toFixed(1) || 0}% {stats.leadsGrowth >= 0 ? '↑' : '↓'}
                    </span>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <span>Converted Clients</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalClients || 0}</div>
                    <span className={`badge-pastel ${stats.clientsGrowth >= 0 ? 'green' : 'red'}`} style={{ marginBottom: '4px' }}>
                      {stats.clientsGrowth > 0 ? '+' : ''}{stats.clientsGrowth?.toFixed(1) || 0}% {stats.clientsGrowth >= 0 ? '↑' : '↓'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* New Line Chart for Revenue Trend */}
          {hasFinanceAccess && stats.revenueTrend && stats.revenueTrend.length > 0 && (
            <div className="card premium-card" style={{ marginBottom: '32px', padding: '24px' }}>
              <h3 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>Revenue vs Expenses (Last 6 Months)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Month-over-month financial trend</p>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 4. Interactive Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            <div className="card premium-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>Event Pipeline</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Hover to expand stage details</p>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      {...({
                        activeIndex: activeIndex,
                        activeShape: renderActiveShape
                      } as any)}
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
            </>
          )}

          {/* 5. Real-time Activity Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            
            {/* Recent Leads */}
            {(hasRole('ADMIN') || hasRole('EVENT_MANAGER') || hasRole('FINANCE_MANAGER') || hasRole('EVENT_HEAD')) && (
            <div className="card premium-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Newest Leads</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentLeads.length === 0 ? (
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No leads found.</div>
                ) : (
                  recentLeads.map(lead => {
                    const getAvatarColor = (name: string) => {
                      const colors = [{ bg: '#E0F2FE', text: '#0284C7' }, { bg: '#FEF08A', text: '#854D0E' }, { bg: '#BBF7D0', text: '#166534' }, { bg: '#FCE7F3', text: '#DB2777' }];
                      const index = name.length % colors.length;
                      return colors[index];
                    };
                    const avatarStyle = getAvatarColor(lead.name || '');
                    
                    return (
                      <div key={lead.id} className="hover-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <div className="avatar" style={{ background: avatarStyle.bg, color: avatarStyle.text }}>
                            {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{lead.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.company || lead.email}</div>
                        </div>
                        <span className={`badge-pastel ${lead.eventType?.toLowerCase().includes('wedding') ? 'purple' : 'blue'}`}>
                          {lead.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            )}

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
                    <div key={event.id} className="hover-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid var(--border-color)', borderRadius: '8px' }}>
                       <div style={{ background: '#FEF9C3', padding: '8px', borderRadius: '8px', textAlign: 'center', minWidth: '45px', border: '1px solid #FEF08A' }}>
                          <div style={{ fontSize: '0.7rem', color: '#B45309', textTransform: 'uppercase', fontWeight: 700 }}>
                             {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400E', lineHeight: 1 }}>
                             {new Date(event.startDate).getDate()}
                          </div>
                       </div>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{event.name}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.venue || 'No venue'}</div>
                       </div>
                       <span className="badge-pastel orange">{event.status || 'Planning'}</span>
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
                    <div key={quote.id} className="hover-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid var(--border-color)', borderRadius: '8px' }}>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{quote.referenceNumber}</span>
                            <span style={{ color: '#16A34A', fontWeight: 700 }}>₹{quote.totalAmount?.toLocaleString() || 0}</span>
                         </div>
                       </div>
                       <span className={`badge-pastel ${quote.status === 'ACCEPTED' ? 'green' : quote.status === 'SENT' ? 'blue' : 'gray'}`}>{quote.status}</span>
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
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          border-color: var(--primary-500);
        }
        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 16px 20px;
          border-radius: 16px;
          min-width: 240px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .quick-action-btn:hover {
          background: var(--bg-hover);
          border-color: var(--primary-500);
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

