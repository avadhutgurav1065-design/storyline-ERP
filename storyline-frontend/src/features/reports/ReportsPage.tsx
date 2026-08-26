import { useState, useEffect } from 'react';
import api, { financeApi } from '../../api/client';

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
    totalExpenses: 0,
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

  const maxBarValue = Math.max(finance.totalRevenue, finance.totalExpenses, 1000);
  const revenueHeight = `${(finance.totalRevenue / maxBarValue) * 100}%`;
  const expenseHeight = `${(finance.totalExpenses / maxBarValue) * 100}%`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Management Reports</h1>
          <p className="page-subtitle">Comprehensive analytics across CRM, Events, and Finance</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>Export PDF</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
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

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Financial Performance</h3>
          <div style={{ display: 'flex', height: '200px', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', gap: '8px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>₹{finance.totalRevenue.toLocaleString()}</div>
              <div style={{ width: '100%', background: 'var(--success)', height: revenueHeight, minHeight: '10px', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Revenue</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', gap: '8px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--danger)' }}>₹{finance.totalExpenses.toLocaleString()}</div>
              <div style={{ width: '100%', background: 'var(--danger)', height: expenseHeight, minHeight: '10px', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Expenses</div>
            </div>

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

