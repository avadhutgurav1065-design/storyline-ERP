import { useState, useEffect, type FormEvent } from 'react';
import { financeApi } from '../../api/client';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    category: 'VENDOR',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    vendorId: '',
    eventId: '',
    paymentMethod: 'BANK_TRANSFER'
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await financeApi.listExpenses();
      setExpenses(res.data.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await financeApi.createExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        vendorId: formData.vendorId ? Number(formData.vendorId) : null,
        eventId: formData.eventId ? Number(formData.eventId) : null,
      });
      setShowModal(false);
      setFormData({ ...formData, amount: '', description: '', vendorId: '', eventId: '' });
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses & Vendor Payments</h1>
          <p className="page-subtitle">Track operational costs and money going out</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record Expense</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vendor ID</th>
                <th>Event ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No expenses found</td></tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.expenseDate}</td>
                    <td>
                      <span className={`badge ${e.category === 'VENDOR' ? 'badge-primary' : 'badge-ghost'}`}>
                        {e.category}
                      </span>
                    </td>
                    <td>{e.description}</td>
                    <td>{e.vendorId || '-'}</td>
                    <td>{e.eventId || '-'}</td>
                    <td><div style={{ fontWeight: 600, color: 'var(--danger)' }}>-₹{e.amount?.toLocaleString()}</div></td>
                    <td>
                      <span className="badge badge-success">{e.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Record Expense</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="VENDOR">Vendor Payment</option>
                    <option value="LOGISTICS">Logistics/Transport</option>
                    <option value="SALARY">Staff Salary</option>
                    <option value="OFFICE">Office Expense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" required value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description *</label>
                <input className="form-input" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Catering advance" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select className="form-select" required value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Vendor ID (Optional)</label>
                  <input type="number" className="form-input" value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Event ID (Optional)</label>
                  <input type="number" className="form-input" value={formData.eventId} onChange={e => setFormData({...formData, eventId: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

