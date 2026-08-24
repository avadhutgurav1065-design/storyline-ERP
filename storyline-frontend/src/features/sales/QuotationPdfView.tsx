import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { salesApi } from '../../api/client';

export default function QuotationPdfView() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await salesApi.listQuotations(); 
        // In a real scenario, use salesApi.getQuotation(id)
        // For now, since client.ts doesn't have getQuotation by ID specifically, 
        // we filter from list or we can assume it works if we add it. 
        // Let's assume we fetch it directly if we had the endpoint.
        // Actually, we do have a way, let's fetch list and find it:
        const allQuotes = res.data.data.content;
        const found = allQuotes.find((q: any) => q.id === Number(id));
        setQuote(found);
        
        // Print automatically when loaded
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuotation();
  }, [id]);

  if (!quote) return <div style={{ padding: '40px' }}>Loading Document...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', color: 'black' }} className="print-view">
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body { background: white; margin: 0; padding: 0; }
            .sidebar, .topbar { display: none !important; }
            .app-content { margin: 0 !important; padding: 0 !important; }
          }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { font-weight: bold; background-color: #f8f9fa; color: #333; }
        `}
      </style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 10px 0', color: '#111' }}>STORYLINE EVENTS</h1>
          <p style={{ margin: '0', color: '#555' }}>123 Event Horizon Way<br/>Mumbai, MH 400001<br/>contact@storylineevents.com</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>QUOTATION</h1>
          <p style={{ margin: '0 0 5px 0' }}><strong>Quote #:</strong> {quote.quoteNumber}</p>
          <p style={{ margin: '0 0 5px 0' }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          <p style={{ margin: '0' }}><strong>Version:</strong> v{quote.version}</p>
        </div>
      </div>

      {/* Client & Event Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '10px' }}>Prepared For:</h3>
          <p style={{ margin: '0' }}><strong>Client ID:</strong> {quote.clientId}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '10px' }}>Event Details:</h3>
          <p style={{ margin: '0' }}><strong>{quote.eventName}</strong></p>
          <p style={{ margin: '0' }}>{quote.eventDate || 'Date TBD'}</p>
          <p style={{ margin: '0' }}>Pax: {quote.pax || 'TBD'} | Venue: {quote.venue || 'TBD'}</p>
        </div>
      </div>

      {/* Line Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr>
            <th>Description</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Unit Price</th>
            <th style={{ textAlign: 'center' }}>Tax %</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {quote.items && quote.items.length > 0 ? (
            quote.items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td>{item.description}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>₹{item.unitPrice?.toLocaleString()}</td>
                <td style={{ textAlign: 'center' }}>{item.taxPercent}%</td>
                <td style={{ textAlign: 'right' }}>₹{item.total?.toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No line items defined.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Subtotal:</span>
            <span>₹{quote.totalAmount?.toLocaleString() || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Taxes:</span>
            <span>₹{quote.taxAmount?.toLocaleString() || 0}</span>
          </div>
          {quote.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'red' }}>
              <span>Discount:</span>
              <span>-₹{quote.discountAmount?.toLocaleString() || 0}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Grand Total:</span>
            <span>₹{quote.grandTotal?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '50px', borderTop: '1px solid #ddd', paddingTop: '20px', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
        <p style={{ margin: '0 0 5px 0' }}>This quotation is valid for 30 days from the date of issue.</p>
        <p style={{ margin: '0' }}>Thank you for considering Storyline Events for your special day!</p>
      </div>
    </div>
  );
}
