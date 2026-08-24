import { useState, useEffect, type FormEvent } from 'react';
import { financeApi } from '../../api/client';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientId: '',
    issueDate: '',
    grandTotal: '',
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await financeApi.listInvoices();
      setInvoices(res.data.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await financeApi.createInvoice({
        ...formData,
        clientId: Number(formData.clientId),
        grandTotal: parseFloat(formData.grandTotal),
        totalAmount: parseFloat(formData.grandTotal)
      });
      setShowModal(false);
      setFormData({ invoiceNumber: '', clientId: '', issueDate: '', grandTotal: '' });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'badge-warning',
    SENT: 'badge-info',
    PARTIALLY_PAID: 'badge-primary',
    PAID: 'badge-success',
    OVERDUE: 'badge-danger',
    CANCELLED: 'badge-ghost',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage client billing and accounts receivable</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Invoice</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Client ID</th>
                <th>Issue Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No invoices found</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.invoiceNumber}</div>
                    </td>
                    <td>{inv.clientId}</td>
                    <td>{inv.issueDate}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>₹{inv.grandTotal?.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paid: ₹{inv.amountPaid?.toLocaleString() || 0}</div>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[inv.status] || 'badge-primary'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" title="Download PDF" onClick={() => window.print()}>📥</button>
                        <button className="btn btn-success btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => window.location.href = '/finance/client-payments'}>Add Payment</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">Create Manual Invoice</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Invoice Number *</label>
                  <input className="form-input" required value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} placeholder="INV-2026-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Client ID *</label>
                  <input type="number" className="form-input" required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Issue Date *</label>
                  <input type="date" className="form-input" required value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Grand Total (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={formData.grandTotal} onChange={e => setFormData({...formData, grandTotal: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
