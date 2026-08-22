import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalClients: 0,
    totalEvents: 0,
    monthlyRevenue: 0
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Admin'} 👋</h1>
          <p className="page-subtitle">Here is what's happening with your business today.</p>
        </div>
        <button className="btn btn-primary">Download Report</button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total Revenue (Month)</div>
            <div className="stat-value">₹{stats.monthlyRevenue?.toLocaleString() || 0}</div>
            <div className="stat-trend trend-up">↑ 12.5% vs last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Events</div>
            <div className="stat-value">{stats.totalEvents || 0}</div>
            <div className="stat-trend trend-up">↑ 3 new this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Leads</div>
            <div className="stat-value">{stats.totalLeads || 0}</div>
            <div className="stat-trend trend-down">↓ 2.1% vs last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Clients</div>
            <div className="stat-value">{stats.totalClients || 0}</div>
            <div className="stat-trend trend-up">↑ 5% vs last month</div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
        {/* Left Column - Main Activity */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
          </div>
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            System activity logging will be shown here.
          </div>
        </div>

        {/* Right Column - Secondary Info */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <div className="card-title">Upcoming Tasks</div>
          </div>
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Your pending tasks will appear here.
          </div>
        </div>
      </div>
    </div>
  );
}
