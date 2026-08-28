import { useState, useEffect, type FormEvent } from 'react';
import { salesApi, crmApi, financeApi } from '../../api/client';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

export default function QuotationHistoryPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  
  const { triggerNotification } = useNotification();
  
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [invoiceType, setInvoiceType] = useState('PROFORMA');
  const [invoicePercentage, setInvoicePercentage] = useState(100);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quoteRes, cliRes] = await Promise.all([
        salesApi.listQuotations({ search }),
        crmApi.listClients()
      ]);
      setQuotations(quoteRes.data.data.content || []);
      
      const cMap: Record<number, any> = {};
      (cliRes.data.data.content || []).forEach((c: any) => { cMap[c.id] = c; });
      setClientsMap(cMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const openInvoiceModal = (quote: any) => {
    setSelectedQuote(quote);
    setInvoiceType('PROFORMA');
    setInvoicePercentage(100);
    setShowInvoiceModal(true);
  };

  const handleGenerateInvoice = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    
    try {
      const pct = invoicePercentage / 100;
      const baseAmount = (selectedQuote.totalAmount || 0) * pct;
      const taxAmt = (selectedQuote.taxAmount || 0) * pct;
      const grandTotal = baseAmount + taxAmt;
      
      await financeApi.createInvoice({
        clientId: selectedQuote.clientId,
        quotationId: selectedQuote.id,
        issueDate: new Date().toISOString().split('T')[0],
        totalAmount: baseAmount,
        taxAmount: taxAmt,
        grandTotal: grandTotal,
        status: invoiceType
      });
      
      setShowInvoiceModal(false);
      triggerNotification('Invoice Generated', `Successfully created ${invoiceType} invoice for ${selectedQuote.quoteNumber}`, 'success');
      // Optionally redirect to invoices page
      // window.location.href = '/finance/invoices';
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to generate invoice', 'error');
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'badge-warning',
    SENT: 'badge-info',
    REJECTED: 'badge-danger',
    APPROVED: 'badge-success',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotation History & Search</h1>
          <p className="page-subtitle">Search across all versions and past quotes</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by Quote No, Client, Event Name..." 
            defaultValue={search}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value;
                window.history.pushState({}, '', `/quotation-history?q=${val}`);
                fetchData(); 
              }
            }}
          />
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Quote No.</th>
                <th>Client</th>
                <th>Event Details</th>
                <th>Version</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading history...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No quotation history found</td></tr>
              ) : (
                quotations.map((quote) => {
                  const client = clientsMap[quote.clientId];
                  return (
                  <tr key={quote.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{quote.quoteNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quote.createdAt?.substring(0,10)}</div>
                    </td>
                    <td>
                      {client ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{client.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.company || 'Individual'}</div>
                        </div>
                      ) : quote.clientId}
                    </td>
                    <td>
                      <div>{quote.eventName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {quote.eventDate || 'TBD'} • {quote.pax || 0} pax
                      </div>
                    </td>
                    <td>v{quote.version}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>₹{quote.grandTotal?.toLocaleString() || 0}</div>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[quote.status]}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td>
                      {quote.status === 'APPROVED' && (
                        <button className="btn btn-primary btn-sm" onClick={() => openInvoiceModal(quote)}>Generate Invoice</button>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showInvoiceModal && selectedQuote && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="modal-content animate-fade-in card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header" style={{ marginBottom: '20px' }}>
              <div className="card-title">Generate Invoice</div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>For {selectedQuote.quoteNumber}</p>
            </div>
            <form onSubmit={handleGenerateInvoice}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Invoice Type</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="radio" name="invoiceType" value="PROFORMA" checked={invoiceType === 'PROFORMA'} onChange={() => setInvoiceType('PROFORMA')} />
                    Proforma
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="radio" name="invoiceType" value="DRAFT" checked={invoiceType === 'DRAFT'} onChange={() => setInvoiceType('DRAFT')} />
                    Tax Invoice (Draft)
                  </label>
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Percentage to Invoice</label>
                <select className="form-input" value={invoicePercentage} onChange={e => setInvoicePercentage(Number(e.target.value))}>
                  <option value={100}>100% (Full Amount)</option>
                  <option value={50}>50%</option>
                  <option value={30}>30% (Booking Advance)</option>
                  <option value={20}>20%</option>
                </select>
                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Base Amount:</span>
                    <strong>₹{((selectedQuote.totalAmount || 0) * (invoicePercentage/100)).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Tax (GST):</span>
                    <strong>₹{((selectedQuote.taxAmount || 0) * (invoicePercentage/100)).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '4px', marginTop: '4px' }}>
                    <span>Total to Invoice:</span>
                    <strong style={{ color: 'var(--primary-color)' }}>₹{((selectedQuote.grandTotal || 0) * (invoicePercentage/100)).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

