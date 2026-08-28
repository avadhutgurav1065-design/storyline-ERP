import { useState, useEffect } from 'react';
import api, { financeApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function PettyCashPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    transactionType: 'WITHDRAWAL',
    amount: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const { triggerNotification } = useNotification();
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, balRes] = await Promise.all([
        financeApi.listPettyCashTransactions({ size: 100, sort: 'transactionDate,desc' }),
        financeApi.getPettyCashBalance()
      ]);
      setTransactions(txRes.data.data.content || []);
      setBalance(balRes.data.data || 0);
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to fetch Petty Cash data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeApi.recordPettyCashTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        recordedBy: (user as any)?.username || 'Unknown'
      });
      triggerNotification('Success', 'Transaction recorded', 'success');
      setShowModal(false);
      setFormData({
        transactionType: 'WITHDRAWAL',
        amount: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (err: any) {
      console.error(err);
      const resData = err.response?.data;
      if (resData && resData.errorCode === 'VALIDATION_ERROR' && resData.data) {
        const issues = Object.values(resData.data).join(', ');
        triggerNotification('Validation Error', issues, 'error');
      } else {
        triggerNotification('Error', resData?.message || err.message || 'Failed to record transaction', 'error');
      }
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Petty Cash Ledger</h1>
          <p className="page-subtitle">Track minor cash expenses and deposits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Transaction</button>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '20px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Current Floating Balance</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            ₹{balance.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'var(--text-muted)' }}>Maintained by Finance Dept.</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No petty cash transactions found.</td>
                </tr>
              )}
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.transactionDate}</td>
                  <td>{tx.description}</td>
                  <td>
                    <span className={`badge ${tx.transactionType === 'DEPOSIT' ? 'badge-success' : 'badge-warning'}`}>
                      {tx.transactionType}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: tx.transactionType === 'DEPOSIT' ? 'var(--success)' : 'inherit' }}>
                    {tx.transactionType === 'DEPOSIT' ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                  </td>
                  <td>{tx.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header">
              <div className="card-title">Record Petty Cash Transaction</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Transaction Type</label>
                <select className="form-input" value={formData.transactionType} onChange={e => setFormData({...formData, transactionType: e.target.value})}>
                  <option value="WITHDRAWAL">Withdrawal (Expense)</option>
                  <option value="DEPOSIT">Deposit (Add Funds)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" step="0.01" className="form-input" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <input type="text" className="form-input" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Office tea, auto fare..." />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" required value={formData.transactionDate} onChange={e => setFormData({...formData, transactionDate: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
