import { useState, useEffect, type FormEvent } from 'react';
import { salesApi, crmApi } from '../../api/client';
import { useSearchParams } from 'react-router-dom';
import { generateQuotationPdf } from '../../utils/pdfGenerator';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get('clientId');

  const [formData, setFormData] = useState<any>({
    clientId: initialClientId || '',
    eventName: '',
    eventDate: '',
    pax: '',
    venue: '',
    items: [] as any[],
  });

  const fetchClients = async () => {
    try {
      const res = await crmApi.listClients({ size: 100 });
      setClients(res.data.data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      if (initialClientId) {
        const res = await salesApi.getQuotationsByClient(Number(initialClientId));
        setQuotations(res.data.data.content || []);
      } else {
        const res = await salesApi.listQuotations();
        setQuotations(res.data.data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchQuotations();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await salesApi.updateQuotation(formData.id, {
          ...formData,
          clientId: Number(formData.clientId),
          pax: formData.pax ? Number(formData.pax) : null,
        });
      } else {
        await salesApi.createQuotation({
          ...formData,
          clientId: Number(formData.clientId),
          pax: formData.pax ? Number(formData.pax) : null,
        });
      }
      setShowModal(false);
      setFormData({ clientId: formData.clientId, eventName: '', eventDate: '', pax: '', venue: '', items: [] });
      fetchQuotations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await salesApi.updateStatus(id, status);
      fetchQuotations();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'badge-warning',
    SENT: 'badge-info',
    REJECTED: 'badge-danger',
    APPROVED: 'badge-success',
  };


  const handleAddCustom = () => {
    setFormData((prev: any) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, taxPercent: 0 }]
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleDownloadPdf = async (quote: any) => {
    try {
      const client = clients.find(c => c.id === quote.clientId);
      const clientName = client ? `${client.name} (${client.company || 'Individual'})` : 'Client';
      const doc = await generateQuotationPdf(quote, clientName);
      doc.save(`Quotation_${quote.quoteNumber || 'Draft'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  const handleShareWhatsApp = async (quote: any) => {
    try {
      // 1. Automatically download the PDF first so the user has it ready to attach
      await handleDownloadPdf(quote);

      // 2. Prepare the WhatsApp message
      const text = `Hi! Here is the quotation for ${quote.eventName}. Quote No: ${quote.quoteNumber || 'Draft'}. Total Amount: ₹${quote.grandTotal?.toLocaleString() || 0}.\n\n*(Please find the attached PDF Quotation)*\n\nThank you,\nStoryline Design and Events`;
      
      // 3. Open WhatsApp contact selector after a tiny delay so the browser doesn't block the download
      setTimeout(() => {
        // By omitting the 'phone' parameter, WhatsApp asks the user to select a contact from their contact book
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      }, 500);
    } catch (err) {
      console.error(err);
    }
  };

  const currentSubtotal = formData.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);
  const currentTax = formData.items.reduce((acc: number, item: any) => acc + ((item.quantity * item.unitPrice) * (item.taxPercent || 0) / 100), 0);
  const currentGrandTotal = currentSubtotal + currentTax;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">Manage client quotations and pricing</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Quotation</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Quote No.</th>
                <th>Event Details</th>
                <th>Version</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading quotations...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No quotations found</td></tr>
              ) : (
                quotations.map((quote) => (
                  <tr key={quote.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{quote.quoteNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quote.createdAt?.substring(0,10)}</div>
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tax: ₹{quote.taxAmount?.toLocaleString() || 0}</div>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[quote.status]}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          title="Edit Quotation"
                          onClick={() => {
                            setFormData({
                              id: quote.id,
                              clientId: quote.clientId,
                              eventName: quote.eventName,
                              eventDate: quote.eventDate || '',
                              pax: quote.pax || '',
                              venue: quote.venue || '',
                              items: quote.items || [],
                            });
                            setShowModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Download PDF" onClick={() => handleDownloadPdf(quote)}>📥</button>
                        <button className="btn btn-ghost btn-sm" title="Share on WhatsApp" onClick={() => handleShareWhatsApp(quote)}>💬</button>
                        {quote.status === 'DRAFT' && (
                          <button className="btn btn-info btn-sm" style={{ padding: '2px 6px', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(quote.id, 'SENT')}>
                            Send
                          </button>
                        )}
                        {quote.status === 'SENT' && (
                          <>
                            <button className="btn btn-success btn-sm" style={{ padding: '2px 6px', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(quote.id, 'APPROVED')}>
                              Approve
                            </button>
                            <button className="btn btn-danger btn-sm" style={{ padding: '2px 6px', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(quote.id, 'REJECTED')}>
                              Reject
                            </button>
                          </>
                        )}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title">Create Quotation</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Client *</label>
                  <select className="form-select" required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                    <option value="">Select a client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company || 'Individual'})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Event Name *</label>
                  <input className="form-input" required value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} placeholder="e.g. Rahul & Priya Wedding" />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input type="date" className="form-input" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Pax</label>
                  <input type="number" className="form-input" value={formData.pax} onChange={e => setFormData({...formData, pax: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input className="form-input" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Client *</label>
                <select className="form-select" required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company || 'Individual'})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input className="form-input" required value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} placeholder="e.g. Rahul & Priya Wedding" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input type="date" className="form-input" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Pax</label>
                  <input type="number" className="form-input" value={formData.pax} onChange={e => setFormData({...formData, pax: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Venue</label>
                <input className="form-input" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '12px', width: '45%' }}>Item & Description</th>
                      <th style={{ padding: '12px', width: '10%' }}>Qty</th>
                      <th style={{ padding: '12px', width: '15%' }}>Rate (₹)</th>
                      <th style={{ padding: '12px', width: '10%' }}>Tax (%)</th>
                      <th style={{ padding: '12px', width: '15%', textAlign: 'right' }}>Amount (₹)</th>
                      <th style={{ padding: '12px', width: '5%', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item: any, idx: any) => {
                      const rowAmount = (item.quantity * item.unitPrice) * (1 + (item.taxPercent || 0) / 100);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: 0, borderRight: '1px solid var(--border-color)' }}>
                            <textarea 
                              style={{ width: '100%', border: 'none', outline: 'none', padding: '12px', background: 'transparent', resize: 'vertical', minHeight: '45px', fontFamily: 'inherit', fontSize: '0.9rem' }} 
                              placeholder="Item description..." 
                              value={item.description} 
                              onChange={e => updateItem(idx, 'description', e.target.value)} 
                              required 
                            />
                          </td>
                          <td style={{ padding: 0, borderRight: '1px solid var(--border-color)' }}>
                            <input 
                              type="number" 
                              style={{ width: '100%', border: 'none', outline: 'none', padding: '12px', background: 'transparent', fontFamily: 'inherit', fontSize: '0.9rem' }} 
                              placeholder="0" 
                              value={item.quantity} 
                              onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} 
                              required 
                            />
                          </td>
                          <td style={{ padding: 0, borderRight: '1px solid var(--border-color)' }}>
                            <input 
                              type="number" 
                              style={{ width: '100%', border: 'none', outline: 'none', padding: '12px', background: 'transparent', fontFamily: 'inherit', fontSize: '0.9rem' }} 
                              placeholder="0.00" 
                              value={item.unitPrice} 
                              onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} 
                              required 
                            />
                          </td>
                          <td style={{ padding: 0, borderRight: '1px solid var(--border-color)' }}>
                            <input 
                              type="number" 
                              style={{ width: '100%', border: 'none', outline: 'none', padding: '12px', background: 'transparent', fontFamily: 'inherit', fontSize: '0.9rem' }} 
                              placeholder="0" 
                              value={item.taxPercent} 
                              onChange={e => updateItem(idx, 'taxPercent', Number(e.target.value))} 
                              required 
                            />
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 500, fontSize: '0.95rem' }}>
                            {rowAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }} onClick={() => {
                              const newItems = formData.items.filter((_: any, i: any) => i !== idx);
                              setFormData({ ...formData, items: newItems });
                            }}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-color)', fontWeight: 600 }} onClick={handleAddCustom}>+ Add New Row</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <div style={{ width: '300px', background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                    <span>Subtotal</span>
                    <span>₹{currentSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)' }}>
                    <span>Tax</span>
                    <span>₹{currentTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-color)', paddingTop: '15px', fontWeight: 700, fontSize: '1.2rem' }}>
                    <span>Grand Total</span>
                    <span>₹{currentGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

