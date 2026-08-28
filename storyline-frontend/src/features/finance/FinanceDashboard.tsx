import { useState, useEffect } from 'react';
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
      
      setMetrics(metricsRes.data.data || metricsRes.data);
      setQuotations(quotesRes.data.data?.content || []);
      setInvoices(invoicesRes.data.data?.content || []);
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Revenue</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{metrics.totalRevenue?.toLocaleString()}</div>
            </div>
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--warning)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Gross Margin (Event Profit)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{metrics.grossProfit?.toLocaleString()}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '4px' }}>{grossMarginPct}% Margin</div>
            </div>
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--danger)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Overheads</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{metrics.companyOverheads?.toLocaleString()}</div>
            </div>
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--success)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Net Profit</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: metrics.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ₹{metrics.netProfit?.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '4px' }}>{netMarginPct}% Net Margin</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Waterfall / Bar Chart */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '20px' }}>Financial Overview</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#4f46e5" />
                    <Bar dataKey="Direct Costs" fill="#f59e0b" />
                    <Bar dataKey="Overheads" fill="#ef4444" />
                    <Bar dataKey="Net Profit" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '20px' }}>Expense Distribution</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensesBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Accounts Receivable Aging Report */}
          <div className="card" style={{ marginTop: '20px', padding: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Accounts Receivable Aging</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
              <div style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current (Not Due)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>₹{metrics.agingCurrent?.toLocaleString()}</div>
              </div>
              <div style={{ padding: '15px', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#b45309' }}>1 - 7 Days Overdue</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#b45309' }}>₹{metrics.aging1to7Days?.toLocaleString()}</div>
              </div>
              <div style={{ padding: '15px', background: '#ffedd5', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#c2410c' }}>8 - 30 Days Overdue</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#c2410c' }}>₹{metrics.aging8to30Days?.toLocaleString()}</div>
              </div>
              <div style={{ padding: '15px', background: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#b91c1c' }}>30+ Days Overdue</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#b91c1c' }}>₹{metrics.agingOver30Days?.toLocaleString()}</div>
              </div>
              <div style={{ padding: '15px', background: '#f1f5f9', borderRadius: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.9rem', color: '#334155' }}>Total Outstanding</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' }}>₹{metrics.outstandingReceivables?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'QUOTATIONS' && (
        <div className="animate-fade-in card">
          <h3 style={{ marginBottom: '20px' }}>Sales Pipeline & Quotations</h3>
          <div className="table-container">
            <table className="table">
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
