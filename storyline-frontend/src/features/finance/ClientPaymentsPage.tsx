import { useState, useEffect, type FormEvent } from 'react';
import { financeApi } from '../../api/client';

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    invoiceId: '',
    clientId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    transactionId: '',
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await financeApi.listPayments();
      setPayments(res.data.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await financeApi.createPayment({
        ...formData,
        invoiceId: formData.invoiceId ? Number(formData.invoiceId) : null,
        clientId: Number(formData.clientId),
        amount: parseFloat(formData.amount)
      });
      setShowModal(false);
      setFormData({ ...formData, amount: '', transactionId: '', invoiceId: '' });
      fetchPayments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Payments</h1>
          <p className="page-subtitle">Track incoming revenue and invoice settlements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record Payment</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Ref ID</th>
                <th>Date</th>
                <th>Client ID</th>
                <th>Invoice ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Txn ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading payments...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No payments found</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td><div style={{ fontWeight: 600 }}>{p.paymentReference}</div></td>
                    <td>{p.paymentDate}</td>
                    <td>{p.clientId}</td>
                    <td>{p.invoiceId || '-'}</td>
                    <td><div style={{ fontWeight: 600, color: 'var(--success)' }}>₹{p.amount?.toLocaleString()}</div></td>
                    <td>{p.paymentMethod}</td>
                    <td>{p.transactionId || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">Record Client Payment</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Client ID *</label>
                  <input type="number" className="form-input" required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Invoice ID (Optional)</label>
                  <input type="number" className="form-input" value={formData.invoiceId} onChange={e => setFormData({...formData, invoiceId: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Amount Received (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" required value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select className="form-select" required value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction ID</label>
                  <input className="form-input" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
