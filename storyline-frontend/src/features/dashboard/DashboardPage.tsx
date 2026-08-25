import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalLeads: 0,
    totalClients: 0,
    totalEvents: 0,
    monthlyRevenue: 0,
    eventCharts: { PLANNING: 0, IN_PROGRESS: 0, COMPLETED: 0 },
    taskCharts: { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data && res.data.data) {
            setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.fullName || 'Admin'} 👋</h1>
          <p className="page-subtitle">Here is a real-time overview of your events and business progress.</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>Download Report</button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard analytics...</div>
      ) : (
        <>
          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-label">Total Revenue (Month)</div>
              <div className="stat-value">₹{stats.monthlyRevenue?.toLocaleString() || 0}</div>
              <div className="stat-trend trend-up">↑ Paid Invoices</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Events</div>
              <div className="stat-value">{stats.totalEvents || 0}</div>
              <div className="stat-trend trend-up">Total across all statuses</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Leads</div>
              <div className="stat-value">{stats.totalLeads || 0}</div>
              <div className="stat-trend trend-up">Potential business</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Clients</div>
              <div className="stat-value">{stats.totalClients || 0}</div>
              <div className="stat-trend trend-up">Secured accounts</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Event Progress Chart */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Event Progress Breakdown</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => (percent && percent > 0) ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {eventData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Events`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Progress Chart */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Global Checklist Progress</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'var(--bg-secondary)' }} contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--background)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="Tasks" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Activity Logs (Mocked for visual balance) */}
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>Recent System Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                <div style={{ flex: 1, fontSize: '0.95rem' }}>Quotation Q-2023 was converted to Invoice INV-001.</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Just now</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                <div style={{ flex: 1, fontSize: '0.95rem' }}>Task "Finalize Menu" was marked as In Progress.</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2 hours ago</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                <div style={{ flex: 1, fontSize: '0.95rem' }}>New Event "Annual Gala" was created.</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Yesterday</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
