import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { financeApi, salesApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [metrics, setMetrics] = useState<any>(null);
  
  // Data arrays
  const [quotations, setQuotations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const { triggerNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  
  useEffect(() => {
    if (eventIdParam) {
      setActiveTab('INVOICES');
    }
  }, [eventIdParam]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        metricsRes,
        quotesRes,
        invoicesRes,
        paymentsRes,
        expensesRes
      ] = await Promise.all([
        financeApi.getProfitAndLoss(),
        salesApi.listQuotations({ size: 100 }),
        financeApi.listInvoices({ size: 100 }),
        financeApi.listPayments({ size: 100 }),
        financeApi.listExpenses({ size: 200 })
      ]);
      
      let allInvoices = invoicesRes.data.data?.content || [];
      if (eventIdParam) {
        allInvoices = allInvoices.filter((inv: any) => String(inv.eventId) === String(eventIdParam));
      }
      
      setMetrics(metricsRes.data.data || metricsRes.data);
      setQuotations(quotesRes.data.data?.content || []);
      setInvoices(allInvoices);
      setPayments(paymentsRes.data.data?.content || []);
      setExpenses(expensesRes.data.data?.content || []);
      
    } catch (err) {
      console.error(err);
      triggerNotification('Error', "Failed to fetch CFO dashboard data.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading CFO Control Panel...</div>;
  if (!metrics) return null;

  const grossMarginPct = metrics.totalRevenue > 0 
    ? ((metrics.grossProfit / metrics.totalRevenue) * 100).toFixed(1) 
    : 0;

  const netMarginPct = metrics.totalRevenue > 0 
    ? ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1) 
    : 0;

  // Visualization Data
  const expensesBreakdown = [
    { name: 'Direct Event Costs', value: metrics.directEventCosts },
    { name: 'Company Overheads', value: metrics.companyOverheads }
  ];
  const COLORS = ['#8884d8', '#82ca9d'];

  const plData = [
    { name: 'Financials', Revenue: metrics.totalRevenue, 'Direct Costs': metrics.directEventCosts, Overheads: metrics.companyOverheads, 'Net Profit': metrics.netProfit }
  ];

  // Filtering for Expenses
  const eventExtraExpenses = expenses.filter(e => e.eventId != null && e.clientBillable !== null); // Assuming unplanned/extras have this explicitly toggled, or we just show all event expenses. Actually, let's just show all event expenses and highlight billable.
  const officeExpenses = expenses.filter(e => e.eventId == null); // Overheads

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '10px' }}>
        <div>
          <h1 className="page-title">CFO Control Panel</h1>
          <p className="page-subtitle">Central command for company finance, sales, and accounts</p>
        </div>
        <button className="btn btn-outline" onClick={fetchData}>↻ Refresh Data</button>
      </div>

      <div className="tabs" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', display: 'flex', overflowX: 'auto' }}>
        {['OVERVIEW', 'QUOTATIONS', 'INVOICES', 'PAYMENTS', 'EVENT EXPENSES', 'COMPANY OVERHEADS'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="animate-fade-in">
          {/* Top Level Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="card hover-scale" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <span>Total Revenue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>₹{(metrics.totalRevenue/1000).toFixed(1)}k</div>
                <span className="badge-pastel blue" style={{ marginBottom: '4px' }}>Gross</span>
              </div>
            </div>
            
            <div className="card hover-scale" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <span>Gross Margin</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>₹{(metrics.grossProfit/1000).toFixed(1)}k</div>
                <span className="badge-pastel green" style={{ marginBottom: '4px' }}>{grossMarginPct}%</span>
              </div>
            </div>

            <div className="card hover-scale" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <span>Total Overheads</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>₹{(metrics.companyOverheads/1000).toFixed(1)}k</div>
                <span className="badge-pastel red" style={{ marginBottom: '4px' }}>Fixed</span>
              </div>
            </div>

            <div className="card hover-scale" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                <span>Net Profit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#15803D' }}>
                  ₹{(metrics.netProfit/1000).toFixed(1)}k
                </div>
                <span className="badge-pastel green" style={{ marginBottom: '4px', background: '#DCFCE7' }}>{netMarginPct}% Net</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px' }}>
            {/* Waterfall / Bar Chart */}
            <div className="card" style={{ padding: '24px', minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Financial Overview</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => `₹${Number(value).toLocaleString()}`} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Revenue" fill="#3B82F6" radius={[4,4,0,0]} barSize={40} />
                    <Bar dataKey="Direct Costs" fill="#F59E0B" radius={[4,4,0,0]} barSize={40} />
                    <Bar dataKey="Overheads" fill="#EF4444" radius={[4,4,0,0]} barSize={40} />
                    <Bar dataKey="Net Profit" fill="#10B981" radius={[4,4,0,0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="card" style={{ padding: '24px', minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Expense Distribution</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#8B5CF6" />
                      <Cell fill="#EC4899" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                      formatter={(value: any) => `₹${Number(value).toLocaleString()}`} 
                    />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Accounts Receivable Aging Report */}
          <div className="card" style={{ marginTop: '20px', padding: '24px', minWidth: 0, overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.1rem' }}>Accounts Receivable Aging</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '16px' }}>
              <div className="hover-scale" style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{(metrics.agingCurrent/1000).toFixed(1)}k</div>
              </div>
              <div className="hover-scale" style={{ padding: '20px', background: '#FEF9C3', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#A16207', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1 - 7 Days</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#854D0E' }}>₹{(metrics.aging1to7Days/1000).toFixed(1)}k</div>
              </div>
              <div className="hover-scale" style={{ padding: '20px', background: '#FFEDD5', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#C2410C', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>8 - 30 Days</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9A3412' }}>₹{(metrics.aging8to30Days/1000).toFixed(1)}k</div>
              </div>
              <div className="hover-scale" style={{ padding: '20px', background: '#FEE2E2', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#B91C1C', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>30+ Days</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991B1B' }}>₹{(metrics.agingOver30Days/1000).toFixed(1)}k</div>
              </div>
              <div className="hover-scale" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Outstanding</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{(metrics.outstandingReceivables/1000).toFixed(1)}k</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'QUOTATIONS' && (
        <div className="animate-fade-in card">
          <h3 style={{ marginBottom: '20px' }}>Sales Pipeline & Quotations</h3>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="interactive-table">
              <thead>
                <tr>
                  <th>Quote No</th>
                  <th>Client</th>
                  <th>Event Name</th>
                  <th>Grand Total</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 500 }}>{q.quotationNumber}</td>
                    <td>{q.clientName || 'N/A'}</td>
                    <td>{q.eventName}</td>
                    <td>₹{q.grandTotal?.toLocaleString()}</td>
                    <td>{q.validUntil}</td>
                    <td>
                      <span className={`badge ${q.status === 'APPROVED' ? 'badge-success' : q.status === 'DRAFT' ? 'badge-ghost' : 'badge-warning'}`}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {quotations.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center' }}>No quotations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'INVOICES' && (
        <div className="animate-fade-in card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Accounts Receivable & Invoicing</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
               <div style={{ padding: '8px 15px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                 <span style={{ color: '#065f46', fontSize: '0.85rem' }}>Total Outstanding:</span> 
                 <strong style={{ marginLeft: '10px', color: '#065f46' }}>₹{metrics.outstandingReceivables?.toLocaleString()}</strong>
               </div>
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Event</th>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Received</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const balance = (inv.totalAmount || 0) - (inv.amountPaid || 0);
                  const isOverdue = inv.status === 'OVERDUE' || (new Date(inv.dueDate) < new Date() && balance > 0);
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 500 }}>{inv.invoiceNumber}</td>
                      <td>{inv.eventName || 'N/A'}</td>
                      <td style={{ color: isOverdue ? 'var(--danger)' : 'inherit' }}>{inv.dueDate}</td>
                      <td>₹{inv.totalAmount?.toLocaleString()}</td>
                      <td style={{ color: 'var(--success)' }}>₹{inv.amountPaid?.toLocaleString()}</td>
                      <td style={{ fontWeight: 'bold', color: balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        ₹{balance.toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                          {isOverdue && inv.status !== 'PAID' ? 'OVERDUE' : inv.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {invoices.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}>No invoices found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PAYMENTS' && (
        <div className="animate-fade-in card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Payments Collected Ledger</h3>
            <div style={{ padding: '8px 15px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              <span style={{ color: '#065f46', fontSize: '0.85rem' }}>Today's Collections:</span> 
              <strong style={{ marginLeft: '10px', color: '#065f46' }}>₹{metrics.todaysCollections?.toLocaleString()}</strong>
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Invoice Ref</th>
                  <th>Method</th>
                  <th>Transaction ID</th>
                  <th>Amount Received</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>PAY-{p.id}</td>
                    <td>{p.paymentDate}</td>
                    <td>{p.invoiceNumber || p.invoiceId}</td>
                    <td>
                      <span className="badge badge-ghost">{p.paymentMethod}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{p.transactionId || '-'}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>₹{p.amount?.toLocaleString()}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center' }}>No payments collected yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'EVENT EXPENSES' && (
        <div className="animate-fade-in card">
          <h3 style={{ marginBottom: '20px' }}>Event Expenses Tracker</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Event ID</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Client Billable?</th>
                </tr>
              </thead>
              <tbody>
                {eventExtraExpenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.title}</td>
                    <td>EVT-{e.eventId}</td>
                    <td>{e.category}</td>
                    <td>₹{e.amount?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${e.status === 'APPROVED' || e.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td>
                      {e.clientBillable ? (
                        <span className="badge badge-success" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>YES</span>
                      ) : (
                        <span className="badge badge-ghost" style={{ background: '#f1f5f9', color: '#475569' }}>NO (Company Absorbed)</span>
                      )}
                    </td>
                  </tr>
                ))}
                {eventExtraExpenses.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center' }}>No event expenses found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'COMPANY OVERHEADS' && (
        <div className="animate-fade-in card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Company Overheads (Office Expenses)</h3>
            <div style={{ padding: '8px 15px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <span style={{ color: '#991b1b', fontSize: '0.85rem' }}>Total Overheads:</span> 
              <strong style={{ marginLeft: '10px', color: '#991b1b' }}>₹{metrics.companyOverheads?.toLocaleString()}</strong>
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Expense Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {officeExpenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.title}</td>
                    <td>
                      <span className="badge badge-ghost">{e.category}</span>
                    </td>
                    <td>₹{e.amount?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${e.status === 'APPROVED' || e.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.notes || '-'}</td>
                  </tr>
                ))}
                {officeExpenses.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center' }}>No company overheads found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
