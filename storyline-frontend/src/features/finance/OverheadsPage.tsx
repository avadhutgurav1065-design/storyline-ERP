import { useState, useEffect } from 'react';
import { financeApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

export default function OverheadsPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { triggerNotification } = useNotification();

  const [formData, setFormData] = useState({
    category: 'OFFICE_RENT',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await financeApi.listExpenses({ size: 100, sort: 'id,desc' });
      const allExpenses = res.data.data.content || res.data.data || [];
      // Filter only overheads (no event attached)
      setExpenses(allExpenses.filter((e: any) => !e.eventId && !e.vendorId));
    } catch (err) {
      console.error(err);
      triggerNotification('Error', "Failed to fetch overheads.", 'error');
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
      await financeApi.createExpense({
        ...formData,
        amount: Number(formData.amount),
        status: 'PAID', // Overheads are typically recorded once paid
        amountPaid: Number(formData.amount)
      });
      triggerNotification('Success', "Overhead expense recorded successfully", 'success');
      setShowModal(false);
      setFormData({ ...formData, description: '', amount: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', "Failed to record expense", 'error');
    }
  };

  const categories = ['OFFICE_RENT', 'SALARIES', 'SOFTWARE', 'MARKETING', 'UTILITIES', 'MISC'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Overheads</h1>
          <p className="page-subtitle">Manage fixed operational costs independent of events</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record Overhead</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp: any) => (
                <tr key={exp.id}>
                  <td>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                  <td><span className="badge badge-ghost">{exp.category}</span></td>
                  <td>{exp.description}</td>
                  <td>{exp.paymentMethod}</td>
                  <td style={{ fontWeight: 'bold' }}>₹{exp.amount.toLocaleString()}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No overhead expenses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">Record Company Overhead</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description / Particulars</label>
                <input type="text" className="form-input" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. August Office Rent" />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-input" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
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
