import { useState, useEffect } from 'react';
import { financeApi } from '../../api/client';

export default function ProfitLossPage() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await financeApi.getProfitAndLoss();
        if (res.data && res.data.data) {
          setData({
            totalRevenue: res.data.data.totalRevenue || 0,
            totalExpenses: res.data.data.totalExpenses || 0,
            netProfit: res.data.data.netProfit || 0
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading financial data...</div>;

  const isProfitable = data.netProfit >= 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profit & Loss</h1>
          <p className="page-subtitle">Real-time overview of your financial health</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Total Revenue */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            💰
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Revenue (Payments Received)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
              ₹{data.totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            💸
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Expenses & Outflow</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>
              ₹{data.totalExpenses.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: isProfitable ? 'var(--primary)' : 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            {isProfitable ? '📈' : '📉'}
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Net Profit / Loss</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: isProfitable ? 'var(--text)' : 'var(--danger)' }}>
              {isProfitable ? '' : '-'}₹{Math.abs(data.netProfit).toLocaleString()}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
