import { useState, useEffect, type FormEvent } from 'react';
import { financeApi, crmApi, eventsApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<number, any>>({});
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  const { triggerNotification } = useNotification();

  const [editData, setEditData] = useState({
    id: '',
    invoiceNumber: '',
    title: '',
    eventId: '',
    issueDate: '',
    dueDate: '',
    grandTotal: '',
    taxAmount: '0',
    notes: ''
  });

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientId: '',
    eventId: '',
    issueDate: '',
    grandTotal: '',
    taxAmount: '0',
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    transactionId: '',
    notes: ''
  });

  const [scheduleData, setScheduleData] = useState({
    clientId: '',
    grandTotal: '',
    split1: 30, split1Name: 'Advance Payment', split1Days: 0,
    split2: 40, split2Name: 'Before Event', split2Days: 30,
    split3: 30, split3Name: 'After Event', split3Days: 45
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, cliRes, eventsRes] = await Promise.all([
        financeApi.listInvoices(),
        crmApi.listClients(),
        eventsApi.listEvents()
      ]);
      setInvoices(Array.isArray(invRes.data.data) ? invRes.data.data : (invRes.data.data?.content || []));
      setEvents(Array.isArray(eventsRes.data.data) ? eventsRes.data.data : (eventsRes.data.data?.content || []));
      
      const cMap: Record<number, any> = {};
      const clientList = Array.isArray(cliRes.data.data) ? cliRes.data.data : (cliRes.data.data?.content || []);
      clientList.forEach((c: any) => { cMap[c.id] = c; });
      setClientsMap(cMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const gTotal = parseFloat(formData.grandTotal);
      const tax = parseFloat(formData.taxAmount) || 0;
      await financeApi.createInvoice({
        ...formData,
        clientId: Number(formData.clientId),
        eventId: formData.eventId ? Number(formData.eventId) : null,
        grandTotal: gTotal,
        taxAmount: tax,
        totalAmount: gTotal - tax,
        status: 'DRAFT',
        title: 'Manual Invoice'
      });
      setShowModal(false);
      setFormData({ invoiceNumber: '', clientId: '', eventId: '', issueDate: '', grandTotal: '', taxAmount: '0' });
      triggerNotification('Invoice Created', 'New invoice added successfully.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to create invoice.', 'error');
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const gTotal = parseFloat(editData.grandTotal);
      const tax = parseFloat(editData.taxAmount) || 0;
      await financeApi.updateInvoice(Number(editData.id), {
        ...selectedInvoice, // preserve non-edited fields
        invoiceNumber: editData.invoiceNumber,
        title: editData.title,
        eventId: editData.eventId ? Number(editData.eventId) : null,
        issueDate: editData.issueDate,
        dueDate: editData.dueDate,
        grandTotal: gTotal,
        taxAmount: tax,
        totalAmount: gTotal - tax,
        notes: editData.notes
      });
      setShowEditModal(false);
      triggerNotification('Invoice Updated', 'Invoice modified successfully.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to update invoice.', 'error');
    }
  };

  const openEditModal = (inv: any) => {
    if (inv.status === 'PAID') {
      triggerNotification('Notice', 'Cannot edit a fully paid invoice.', 'warning');
      return;
    }
    setSelectedInvoice(inv);
    setEditData({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || '',
      title: inv.title || '',
      eventId: inv.eventId ? inv.eventId.toString() : '',
      issueDate: inv.issueDate || '',
      dueDate: inv.dueDate || '',
      grandTotal: inv.grandTotal ? inv.grandTotal.toString() : '',
      taxAmount: inv.taxAmount ? inv.taxAmount.toString() : '0',
      notes: inv.notes || ''
    });
    setShowEditModal(true);
  };

  const handleScheduleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const gTotal = parseFloat(scheduleData.grandTotal);
      const clientId = Number(scheduleData.clientId);
      const today = new Date();

      const createInvoiceDto = (percent: number, name: string, addDays: number) => {
        const amount = (gTotal * percent) / 100;
        const dDate = new Date(today);
        dDate.setDate(dDate.getDate() + addDays);
        return {
          clientId,
          grandTotal: amount,
          totalAmount: amount,
          taxAmount: 0,
          issueDate: today.toISOString().split('T')[0],
          dueDate: dDate.toISOString().split('T')[0],
          status: 'DRAFT',
          title: name
        };
      };

      const dtos = [
        createInvoiceDto(scheduleData.split1, scheduleData.split1Name, scheduleData.split1Days),
        createInvoiceDto(scheduleData.split2, scheduleData.split2Name, scheduleData.split2Days),
        createInvoiceDto(scheduleData.split3, scheduleData.split3Name, scheduleData.split3Days)
      ];

      await financeApi.createInvoiceSchedule(dtos);
      setShowScheduleModal(false);
      triggerNotification('Schedule Created', 'Invoice schedule generated successfully.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to create invoice schedule.', 'error');
    }
  };

  const openPaymentModal = (inv: any) => {
    setSelectedInvoice(inv);
    const balance = inv.grandTotal - (inv.amountPaid || 0);
    setPaymentData({ ...paymentData, amount: balance.toString() });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await financeApi.createPayment({
        invoiceId: selectedInvoice.id,
        clientId: selectedInvoice.clientId,
        amount: parseFloat(paymentData.amount),
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        notes: paymentData.notes,
        eventId: selectedInvoice.eventId
      });
      setShowPaymentModal(false);
      triggerNotification('Payment Recorded', `Recorded ₹${paymentData.amount} for ${selectedInvoice.invoiceNumber}`, 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to record payment.', 'error');
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'badge-ghost',
    PROFORMA: 'badge-warning',
    SENT: 'badge-info',
    PARTIALLY_PAID: 'badge-primary',
    PAID: 'badge-success',
    OVERDUE: 'badge-danger',
    CANCELLED: 'badge-ghost',
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Invoice Register</h1>
          <p className="page-subtitle">Track client billing, proforma invoices, and accounts receivable</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => setShowScheduleModal(true)}>+ Generate Schedule</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Manual Invoice</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Client</th>
                <th>Issue Date</th>
                <th>Amount (Base + Tax)</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No invoices found</td></tr>
              ) : (
                invoices.map((inv) => {
                  const client = clientsMap[inv.clientId];
                  const balance = inv.grandTotal - (inv.amountPaid || 0);
                  return (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.invoiceNumber}</div>
                      {inv.title && <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{inv.title}</div>}
                    </td>
                    <td>
                      {client ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{client.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.company || 'Individual'}</div>
                        </div>
                      ) : 'Unknown Client'}
                    </td>
                    <td>{inv.issueDate}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>₹{inv.grandTotal?.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Base: ₹{inv.totalAmount?.toLocaleString()} | Tax: ₹{inv.taxAmount?.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: balance > 0 ? '#ef4444' : '#10b981' }}>
                        ₹{balance.toLocaleString()}
                      </div>
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
                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--primary)' }} onClick={() => openEditModal(inv)}>✏️ Edit</button>
                        )}
                        {balance > 0 && inv.status !== 'CANCELLED' && (
                          <button className="btn btn-success btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => openPaymentModal(inv)}>Record Payment</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Manual Invoice Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="modal-content animate-fade-in card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header" style={{ marginBottom: '20px' }}>
              <div className="card-title">Create Manual Invoice</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Invoice Number *</label>
                  <input className="form-input" required value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} placeholder="INV-2026-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Client *</label>
                  <select className="form-input" required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                    <option value="">Select Client...</option>
                    {Object.values(clientsMap).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Event (Optional)</label>
                  <select className="form-input" value={formData.eventId} onChange={e => setFormData({...formData, eventId: e.target.value})}>
                    <option value="">Select Event...</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Issue Date *</label>
                  <input type="date" className="form-input" required value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Grand Total (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={formData.grandTotal} onChange={e => setFormData({...formData, grandTotal: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Tax Amount Included (₹)</label>
                <input type="number" step="0.01" className="form-input" value={formData.taxAmount} onChange={e => setFormData({...formData, taxAmount: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="modal-content animate-fade-in card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header" style={{ marginBottom: '20px' }}>
              <div className="card-title">Edit Invoice</div>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Invoice Number *</label>
                  <input className="form-input" required value={editData.invoiceNumber} onChange={e => setEditData({...editData, invoiceNumber: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Title / Description</label>
                  <input className="form-input" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Event (Optional)</label>
                  <select className="form-input" value={editData.eventId} onChange={e => setEditData({...editData, eventId: e.target.value})}>
                    <option value="">Select Event...</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Issue Date *</label>
                  <input type="date" className="form-input" required value={editData.issueDate} onChange={e => setEditData({...editData, issueDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={editData.dueDate} onChange={e => setEditData({...editData, dueDate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Grand Total (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={editData.grandTotal} onChange={e => setEditData({...editData, grandTotal: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax Amount Included (₹)</label>
                  <input type="number" step="0.01" className="form-input" value={editData.taxAmount} onChange={e => setEditData({...editData, taxAmount: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Invoice Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="modal-content animate-fade-in card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ marginBottom: '20px' }}>
              <div className="card-title">Generate Invoice Schedule</div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Automatically splits a total contract value into 3 invoices.</p>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Client *</label>
                  <select className="form-input" required value={scheduleData.clientId} onChange={e => setScheduleData({...scheduleData, clientId: e.target.value})}>
                    <option value="">Select Client...</option>
                    {Object.values(clientsMap).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Contract Value (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={scheduleData.grandTotal} onChange={e => setScheduleData({...scheduleData, grandTotal: e.target.value})} />
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Invoice 1: {scheduleData.split1Name}</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="number" className="form-input" style={{ width: '80px' }} value={scheduleData.split1} onChange={e => setScheduleData({...scheduleData, split1: Number(e.target.value)})} /> <span style={{ padding: '8px 0' }}>%</span>
                  <input type="text" className="form-input" value={scheduleData.split1Name} onChange={e => setScheduleData({...scheduleData, split1Name: e.target.value})} />
                  <input type="number" className="form-input" placeholder="Days to due" style={{ width: '100px' }} value={scheduleData.split1Days} onChange={e => setScheduleData({...scheduleData, split1Days: Number(e.target.value)})} />
                  <div style={{ fontWeight: 'bold', minWidth: '100px', textAlign: 'right' }}>
                    ₹{((parseFloat(scheduleData.grandTotal || '0') * scheduleData.split1) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Invoice 2: {scheduleData.split2Name}</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="number" className="form-input" style={{ width: '80px' }} value={scheduleData.split2} onChange={e => setScheduleData({...scheduleData, split2: Number(e.target.value)})} /> <span style={{ padding: '8px 0' }}>%</span>
                  <input type="text" className="form-input" value={scheduleData.split2Name} onChange={e => setScheduleData({...scheduleData, split2Name: e.target.value})} />
                  <input type="number" className="form-input" placeholder="Days to due" style={{ width: '100px' }} value={scheduleData.split2Days} onChange={e => setScheduleData({...scheduleData, split2Days: Number(e.target.value)})} />
                  <div style={{ fontWeight: 'bold', minWidth: '100px', textAlign: 'right' }}>
                    ₹{((parseFloat(scheduleData.grandTotal || '0') * scheduleData.split2) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Invoice 3: {scheduleData.split3Name}</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="number" className="form-input" style={{ width: '80px' }} value={scheduleData.split3} onChange={e => setScheduleData({...scheduleData, split3: Number(e.target.value)})} /> <span style={{ padding: '8px 0' }}>%</span>
                  <input type="text" className="form-input" value={scheduleData.split3Name} onChange={e => setScheduleData({...scheduleData, split3Name: e.target.value})} />
                  <input type="number" className="form-input" placeholder="Days to due" style={{ width: '100px' }} value={scheduleData.split3Days} onChange={e => setScheduleData({...scheduleData, split3Days: Number(e.target.value)})} />
                  <div style={{ fontWeight: 'bold', minWidth: '100px', textAlign: 'right' }}>
                    ₹{((parseFloat(scheduleData.grandTotal || '0') * scheduleData.split3) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: (scheduleData.split1 + scheduleData.split2 + scheduleData.split3 === 100) ? 'var(--success)' : 'var(--danger)' }}>
                  Total Split: {scheduleData.split1 + scheduleData.split2 + scheduleData.split3}%
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={(scheduleData.split1 + scheduleData.split2 + scheduleData.split3) !== 100}>Generate</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="modal-content animate-fade-in card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header" style={{ marginBottom: '20px' }}>
              <div className="card-title">Record Payment</div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>For {selectedInvoice.invoiceNumber}</p>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Payment Amount (₹) *</label>
                <input type="number" step="0.01" className="form-input" required value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
              </div>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Payment Date *</label>
                <input type="date" className="form-input" required value={paymentData.paymentDate} onChange={e => setPaymentData({...paymentData, paymentDate: e.target.value})} />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Payment Mode *</label>
                <select className="form-input" required value={paymentData.paymentMethod} onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value})}>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Transaction ID / Reference</label>
                <input type="text" className="form-input" value={paymentData.transactionId} onChange={e => setPaymentData({...paymentData, transactionId: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

