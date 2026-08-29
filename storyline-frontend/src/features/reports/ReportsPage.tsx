import { useState, useEffect } from 'react';
import api, { financeApi } from '../../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    totalClients: 0,
    totalEvents: 0,
    totalInvoices: 0,
    monthlyRevenue: 0
  });
  
  const [finance, setFinance] = useState({
    totalRevenue: 0,
    directEventCosts: 0,
    companyOverheads: 0,
    netProfit: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, financeRes] = await Promise.all([
          api.get('/dashboard/stats'),
          financeApi.getProfitAndLoss()
        ]);
        
        if (dashboardRes.data?.data) {
          setStats(dashboardRes.data.data);
        }
        
        if (financeRes.data?.data) {
          setFinance(financeRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching reports", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Generating Reports...</div>;
  }

  const totalExpenses = (finance.directEventCosts || 0) + (finance.companyOverheads || 0);

  const chartData = [
    { name: 'Revenue', amount: finance.totalRevenue || 0, fill: '#10B981' },
    { name: 'Expenses', amount: totalExpenses, fill: '#EF4444' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Management Reports</h1>
          <p className="page-subtitle">Comprehensive analytics across CRM, Events, and Finance</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => window.print()}>Print / Save PDF</button>
          <button className="btn btn-primary" onClick={() => {
            const csv = `Metric,Value\nTotal Leads,${stats.totalLeads}\nNew Leads,${stats.newLeads}\nConverted Clients,${stats.totalClients}\nTotal Revenue,${finance.totalRevenue}\nTotal Expenses,${totalExpenses}\nNet Profit,${finance.netProfit}`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Storyline_Report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}>Export CSV</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ marginTop: 0 }}>Sales & CRM Overview</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0' }}>Total Leads Generated</td>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>{stats.totalLeads}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0' }}>New / Uncontacted Leads</td>
                <td style={{ fontWeight: 'bold', textAlign: 'right', color: 'var(--primary)' }}>{stats.newLeads}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0' }}>Converted Clients</td>
                <td style={{ fontWeight: 'bold', textAlign: 'right', color: 'var(--success)' }}>{stats.totalClients}</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0' }}>Conversion Rate</td>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>
                  {stats.totalLeads > 0 ? Math.round((stats.totalClients / stats.totalLeads) * 100) : 0}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ marginTop: 0 }}>Financial Performance</h3>
          <div style={{ height: '250px', padding: '20px 0', borderBottom: '1px solid var(--border)', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                  formatter={(value: any) => `₹${Number(value).toLocaleString()}`} 
                />
                <Bar dataKey="amount" radius={[6,6,0,0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Net Profit: </span>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: finance.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              ₹{finance.netProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

