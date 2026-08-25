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

  const handleAddTemplate = (e: any) => {
    const val = e.target.value;
    if (val === 'ALL') {
      setFormData((prev: any) => ({
        ...prev, 
        items: [...prev.items, 
          { description: 'Venue Setup', quantity: 1, unitPrice: 50000, taxPercent: 18 },
          { description: 'Catering (per pax)', quantity: Number(prev.pax) || 100, unitPrice: 1500, taxPercent: 5 },
          { description: 'Photography', quantity: 1, unitPrice: 75000, taxPercent: 18 }
        ]
      }));
    } else if (val === 'DECOR_ONLY') {
      setFormData((prev: any) => ({
        ...prev, 
        items: [...prev.items, { description: 'Premium Decor Package', quantity: 1, unitPrice: 150000, taxPercent: 18 }]
      }));
    }
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
      const text = `Hi! Here is the quotation for ${quote.eventName}. Quote No: ${quote.quoteNumber}. Total Amount: Rs ${quote.grandTotal?.toLocaleString()}.\n\nThank you,\nStoryline Events`;
      // Based on user feedback: "9518780272 this is whatsapp business no of me"
      // Wait, we share TO the client. We need the client's phone number.
      const client = clients.find(c => c.id === quote.clientId);
      const phone = client?.phone || '9518780272';
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">Create Quotation</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
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
              <div className="form-group">
                <label className="form-label">Attach Packages/Items</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select className="form-select" style={{ flex: 1 }} onChange={handleAddTemplate}>
                    <option value="">Select a template...</option>
                    <option value="ALL">Attach All Packages</option>
                    <option value="DECOR_ONLY">Decor Only</option>
                    <option value="FULL_WEDDING">Full Wedding</option>
                  </select>
                  <button type="button" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }} onClick={handleAddCustom}>+ Custom Item</button>
                </div>
              </div>

              {formData.items.length > 0 && (
                <div style={{ marginTop: '15px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '10px' }}>Line Items</div>
                  {formData.items.map((item: any, idx: any) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input className="form-input" style={{ flex: 3 }} placeholder="Item (e.g., Staging)" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} required />
                      <input type="number" className="form-input" style={{ flex: 1 }} placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} required />
                      <input type="number" className="form-input" style={{ flex: 1 }} placeholder="Unit Price" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} required />
                      <input type="number" className="form-input" style={{ flex: 1 }} placeholder="Tax %" value={item.taxPercent} onChange={e => updateItem(idx, 'taxPercent', Number(e.target.value))} required />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                        const newItems = formData.items.filter((_: any, i: any) => i !== idx);
                        setFormData({ ...formData, items: newItems });
                      }}>✕</button>
                    </div>
                  ))}
                  <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.9rem' }}>
                    <div>Subtotal: ₹{currentSubtotal.toLocaleString()}</div>
                    <div>Tax: ₹{currentTax.toLocaleString()}</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '5px' }}>Grand Total: ₹{currentGrandTotal.toLocaleString()}</div>
                  </div>
                </div>
              )}
              
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
