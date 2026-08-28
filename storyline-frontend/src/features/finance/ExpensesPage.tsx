import { useState, useEffect } from 'react';
import api, { financeApi, vendorsApi, eventsApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vendorsMap, setVendorsMap] = useState<Record<number, any>>({});
  const [eventsMap, setEventsMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [statusNotes, setStatusNotes] = useState('');
  
  const [paymentAmount, setPaymentAmount] = useState('');

  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [showEditPOModal, setShowEditPOModal] = useState(false);
  const [poData, setPoData] = useState({
    eventId: '',
    vendorId: '',
    category: 'VENDOR',
    description: '',
    amount: '',
    taxAmount: '0',
    expenseDate: new Date().toISOString().split('T')[0],
    clientBillable: false
  });

  const { triggerNotification } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, vRes, eRes] = await Promise.all([
        financeApi.listExpenses({ size: 100, sort: 'id,desc' }),
        vendorsApi.list(),
        eventsApi.listEvents({ size: 100 })
      ]);
      
      const vMap: any = {};
      const vList = (vRes.data.data as any).content || vRes.data.data || [];
      vList.forEach((v: any) => vMap[v.id] = v);
      setVendorsMap(vMap);

      const eMap: any = {};
      const eList = (eRes.data.data as any).content || eRes.data.data || [];
      eList.forEach((e: any) => eMap[e.id] = e);
      setEventsMap(eMap);

      setExpenses(expRes.data.data.content || []);
    } catch (err) {
      console.error(err);
      triggerNotification('Error', "Failed to fetch vendor bills data.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedExpense) return;
    try {
      let nextStatus = 'WORK_COMPLETED';
      if (selectedExpense.status === 'WORK_COMPLETED') nextStatus = 'APPROVED_FOR_PAYMENT';

      const { default: api } = await import('../../api/client');
      await api.patch(`/finance/expenses/${selectedExpense.id}/status?status=${nextStatus}&notes=${encodeURIComponent(statusNotes)}`);
      
      triggerNotification('Success', `Status updated to ${nextStatus}`, 'success');
      setShowStatusModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', "Failed to update status.", 'error');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    try {
      await api.post(`/finance/expenses/${selectedExpense.id}/pay?amount=${paymentAmount}`);
      triggerNotification('Success', "Vendor Payment Recorded Successfully", 'success');
      setShowPaymentModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', "Failed to record payment.", 'error');
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeApi.createExpense({
        ...poData,
        eventId: poData.eventId ? Number(poData.eventId) : null,
        vendorId: poData.vendorId ? Number(poData.vendorId) : null,
        amount: parseFloat(poData.amount),
        taxAmount: parseFloat(poData.taxAmount) || 0,
        status: 'PO_GENERATED',
        poNumber: `PO-${Date.now()}`, // Autogenerate a temp PO number
        clientBillable: poData.clientBillable
      });
      triggerNotification('Success', "Purchase Order Generated", 'success');
      setShowCreatePOModal(false);
      setPoData({
        eventId: '',
        vendorId: '',
        category: 'VENDOR',
        description: '',
        amount: '',
        taxAmount: '0',
        expenseDate: new Date().toISOString().split('T')[0],
        clientBillable: false
      });
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', "Failed to create PO.", 'error');
    }
  };

  const openStatusModal = (exp: any) => {
    setSelectedExpense(exp);
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const openPaymentModal = (exp: any) => {
    setSelectedExpense(exp);
    const balance = (exp.amount || 0) + (exp.taxAmount || 0) - (exp.amountPaid || 0);
    setPaymentAmount(balance.toString());
    setShowPaymentModal(true);
  };

  const openEditModal = (exp: any) => {
    if (exp.status === 'PAID') {
      triggerNotification('Notice', 'Cannot edit a fully paid PO.', 'warning');
      return;
    }
    setSelectedExpense(exp);
    setPoData({
      eventId: exp.eventId?.toString() || '',
      vendorId: exp.vendorId?.toString() || '',
      category: exp.category || 'VENDOR',
      description: exp.description || '',
      amount: exp.amount?.toString() || '',
      taxAmount: exp.taxAmount?.toString() || '0',
      expenseDate: exp.expenseDate || new Date().toISOString().split('T')[0],
      clientBillable: exp.clientBillable || false
    });
    setShowEditPOModal(true);
  };

  const handleEditPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    try {
      await financeApi.updateExpense(selectedExpense.id, {
        ...selectedExpense,
        eventId: poData.eventId ? Number(poData.eventId) : null,
        vendorId: poData.vendorId ? Number(poData.vendorId) : null,
        category: poData.category,
        description: poData.description,
        amount: parseFloat(poData.amount),
        taxAmount: parseFloat(poData.taxAmount) || 0,
        expenseDate: poData.expenseDate,
        clientBillable: poData.clientBillable
      });
      triggerNotification('Success', "PO/Expense Updated", 'success');
      setShowEditPOModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', "Failed to update PO.", 'error');
    }
  };

  const poExpenses = expenses.filter(e => e.status === 'PO_GENERATED');
  const pendingApproval = expenses.filter(e => e.status === 'WORK_COMPLETED');
  const accountsPayable = expenses.filter(e => e.status === 'APPROVED_FOR_PAYMENT' || e.status === 'PARTIALLY_PAID');
  const paidExpenses = expenses.filter(e => e.status === 'PAID');

  const ExpenseCard = ({ exp, actionButton }: { exp: any, actionButton: React.ReactNode }) => {
    const v = vendorsMap[exp.vendorId];
    const ev = eventsMap[exp.eventId];
    const total = (exp.amount || 0) + (exp.taxAmount || 0);
    const balance = total - (exp.amountPaid || 0);
    
    return (
      <div className="card" style={{ marginBottom: '15px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{exp.poNumber || `PO-${exp.id}`}</span>
          <span className="badge badge-ghost">{exp.status}</span>
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '4px' }}>{v?.name || `Vendor ${exp.vendorId}`}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{exp.description}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>🗓 Event: {ev?.name || 'General'}</div>
        
        {exp.clientBillable && (
          <div style={{ marginTop: '6px' }}>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>CLIENT BILLABLE (EXTRA)</span>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</div>
            <div style={{ fontWeight: 600 }}>₹{total.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Balance Due</div>
            <div style={{ fontWeight: 600, color: balance > 0 ? 'var(--danger)' : 'var(--success)' }}>₹{balance.toLocaleString()}</div>
          </div>
        </div>

        {exp.approvalNotes && (
          <div style={{ marginTop: '10px', fontSize: '0.85rem', fontStyle: 'italic', padding: '8px', borderLeft: '3px solid var(--border)', background: 'var(--bg-main)' }}>
            "{exp.approvalNotes}"
          </div>
        )}

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          {actionButton}
          {exp.status !== 'PAID' && (
             <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
               <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openPaymentModal(exp)}>💳 Pay</button>
               <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEditModal(exp)}>✏️ Edit</button>
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Vendor POs & Bills</h1>
          <p className="page-subtitle">3-Step Approval Pipeline for Vendor Accounts Payable</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={fetchData}>↻ Refresh</button>
          <button className="btn btn-primary" onClick={() => setShowCreatePOModal(true)}>+ Generate PO</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading Finance Data...</div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
          
          {/* STEP 1: PO Generated */}
          <div style={{ flex: '0 0 320px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>1. Active POs ({poExpenses.length})</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Waiting for Dept. Head to verify work.</div>
            {poExpenses.map(exp => (
              <ExpenseCard 
                key={exp.id} 
                exp={exp} 
                actionButton={<button className="btn btn-primary btn-sm" style={{ flex: 2 }} onClick={() => openStatusModal(exp)}>✓ Mark Work Done</button>} 
              />
            ))}
          </div>

          {/* STEP 2: Pending Approval */}
          <div style={{ flex: '0 0 320px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--warning)' }}>2. Pending Approval ({pendingApproval.length})</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Waiting for Event Manager approval.</div>
            {pendingApproval.map(exp => (
              <ExpenseCard 
                key={exp.id} 
                exp={exp} 
                actionButton={<button className="btn btn-warning btn-sm" style={{ flex: 2, color: 'white' }} onClick={() => openStatusModal(exp)}>🛡️ Approve for Payment</button>} 
              />
            ))}
          </div>

          {/* STEP 3: Accounts Payable */}
          <div style={{ flex: '0 0 320px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--danger)' }}>3. Accounts Payable ({accountsPayable.length})</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Finance Department to clear dues.</div>
            {accountsPayable.map(exp => (
              <ExpenseCard 
                key={exp.id} 
                exp={exp} 
                actionButton={<button className="btn btn-success btn-sm" style={{ flex: 2 }} onClick={() => openPaymentModal(exp)}>💰 Record Payment</button>} 
              />
            ))}
          </div>
          
          {/* COMPLETED */}
          <div style={{ flex: '0 0 320px', opacity: 0.8 }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--success)' }}>Paid in Full ({paidExpenses.length})</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Closed accounts.</div>
            {paidExpenses.map(exp => (
              <ExpenseCard 
                key={exp.id} 
                exp={exp} 
                actionButton={null} 
              />
            ))}
          </div>

        </div>
      )}

      {/* Modals */}
      {showStatusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header">
              <div className="card-title">Update PO Status</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowStatusModal(false)}>✕</button>
            </div>
            <div style={{ marginBottom: '15px' }}>
              Updating <strong>{selectedExpense?.poNumber}</strong> to 
              <span className="badge badge-primary" style={{ marginLeft: '8px' }}>
                {selectedExpense?.status === 'PO_GENERATED' ? 'WORK COMPLETED' : 'APPROVED FOR PAYMENT'}
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Approval Notes (Optional)</label>
              <textarea 
                className="form-input" 
                rows={3} 
                value={statusNotes} 
                onChange={e => setStatusNotes(e.target.value)} 
                placeholder="E.g., Verified quality, deduction of 1000 for delay..." 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateStatus}>Confirm Status Update</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header">
              <div className="card-title">Record Vendor Payment</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="form-group">
                <label className="form-label">Payment Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(e.target.value)} 
                  max={(selectedExpense?.amount || 0) + (selectedExpense?.taxAmount || 0) - (selectedExpense?.amountPaid || 0)}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Maximum allowed: ₹{((selectedExpense?.amount || 0) + (selectedExpense?.taxAmount || 0) - (selectedExpense?.amountPaid || 0)).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate PO Modal */}
      {showCreatePOModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">Generate Purchase Order (PO)</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreatePOModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreatePO}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Select Vendor *</label>
                  <select className="form-input" required value={poData.vendorId} onChange={e => setPoData({...poData, vendorId: e.target.value})}>
                    <option value="">-- Choose Vendor --</option>
                    {Object.values(vendorsMap).map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Linked Event (Optional)</label>
                  <select className="form-input" value={poData.eventId} onChange={e => setPoData({...poData, eventId: e.target.value})}>
                    <option value="">-- None --</option>
                    {Object.values(eventsMap).map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-input" required value={poData.category} onChange={e => setPoData({...poData, category: e.target.value})}>
                  <option value="VENDOR">Vendor / Sub-contractor</option>
                  <option value="LOGISTICS">Logistics / Transport</option>
                  <option value="MATERIAL">Material Purchase</option>
                  <option value="PETTY_CASH">Petty Cash</option>
                  <option value="EMPLOYEE_REIMBURSEMENT">Employee Reimbursement</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Scope of Work *</label>
                <textarea className="form-input" required rows={2} value={poData.description} onChange={e => setPoData({...poData, description: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={poData.amount} onChange={e => setPoData({...poData, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax (₹)</label>
                  <input type="number" step="0.01" className="form-input" value={poData.taxAmount} onChange={e => setPoData({...poData, taxAmount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Issue Date *</label>
                  <input type="date" className="form-input" required value={poData.expenseDate} onChange={e => setPoData({...poData, expenseDate: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={poData.clientBillable} onChange={e => setPoData({...poData, clientBillable: e.target.checked})} />
                  <span>Mark as Client Billable (Extra Expense)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreatePOModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate PO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit PO Modal */}
      {showEditPOModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">Edit Purchase Order (PO)</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditPOModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditPO}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Select Vendor *</label>
                  <select className="form-input" required value={poData.vendorId} onChange={e => setPoData({...poData, vendorId: e.target.value})}>
                    <option value="">-- Choose Vendor --</option>
                    {Object.values(vendorsMap).map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Linked Event (Optional)</label>
                  <select className="form-input" value={poData.eventId} onChange={e => setPoData({...poData, eventId: e.target.value})}>
                    <option value="">-- None --</option>
                    {Object.values(eventsMap).map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-input" required value={poData.category} onChange={e => setPoData({...poData, category: e.target.value})}>
                  <option value="VENDOR">Vendor / Sub-contractor</option>
                  <option value="LOGISTICS">Logistics / Transport</option>
                  <option value="MATERIAL">Material Purchase</option>
                  <option value="PETTY_CASH">Petty Cash</option>
                  <option value="EMPLOYEE_REIMBURSEMENT">Employee Reimbursement</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Scope of Work *</label>
                <textarea className="form-input" required rows={2} value={poData.description} onChange={e => setPoData({...poData, description: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={poData.amount} onChange={e => setPoData({...poData, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax (₹)</label>
                  <input type="number" step="0.01" className="form-input" value={poData.taxAmount} onChange={e => setPoData({...poData, taxAmount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Issue Date *</label>
                  <input type="date" className="form-input" required value={poData.expenseDate} onChange={e => setPoData({...poData, expenseDate: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={poData.clientBillable} onChange={e => setPoData({...poData, clientBillable: e.target.checked})} />
                  <span>Mark as Client Billable (Extra Expense)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditPOModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update PO</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
