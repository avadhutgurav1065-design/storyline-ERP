import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { salesApi, crmApi } from '../../api/client';

export default function QuotationPdfView() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const [quotesRes, clientsRes] = await Promise.all([
          salesApi.listQuotations(),
          crmApi.listClients()
        ]);
        const allQuotes = quotesRes.data.data.content || quotesRes.data.data;
        const found = allQuotes.find((q: any) => q.id === Number(id));

        if (found) {
          const clientsList = clientsRes.data.data.content || clientsRes.data.data;
          const client = clientsList.find((c: any) => c.id === found.clientId);
          found.clientName = client ? client.name : 'Unknown Client';
          found.clientCompany = client?.companyName || client?.company || '';
        }

        setQuote(found);
        setTimeout(() => { window.print(); }, 600);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuotation();
  }, [id]);

  if (!quote) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Georgia, serif', color: '#6b5b4e' }}>
      Loading Document...
    </div>
  );

  const subtotal = quote.totalAmount || 0;
  const tax = quote.taxAmount || 0;
  const discount = quote.discountAmount || 0;
  const grandTotal = quote.grandTotal || 0;

  return (
    <div className="quotation-print-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f9f0ea;
          font-family: 'Inter', sans-serif;
        }

        @media print {
          html, body {
            background: #fdf4ef !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0; padding: 0;
          }
          .sidebar, .topbar, .app-content > *:not(.quotation-print-wrapper) { display: none !important; }
          .app-content { margin: 0 !important; padding: 0 !important; background: transparent !important; }
          .quotation-print-wrapper { margin: 0 !important; box-shadow: none !important; }
        }

        .quotation-print-wrapper {
          background: #fdf4ef;
          max-width: 860px;
          margin: 30px auto;
          padding: 0;
          font-family: 'Inter', sans-serif;
          color: #2c1810;
          box-shadow: 0 4px 30px rgba(0,0,0,0.12);
          border-radius: 4px;
          overflow: hidden;
        }

        /* ── HEADER BAND ── */
        .qt-header {
          background: linear-gradient(135deg, #f5e6dc 0%, #ede0d6 100%);
          border-bottom: 3px solid #c9a07c;
          padding: 32px 40px 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .qt-logo-block {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .qt-logo-img {
          width: 110px;
          height: 110px;
          object-fit: contain;
          filter: drop-shadow(0 2px 6px rgba(180,140,80,0.35));
        }

        .qt-company-block h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #3d1f0e;
          letter-spacing: 0.03em;
          margin-bottom: 4px;
        }

        .qt-company-block p {
          font-size: 0.78rem;
          color: #6b4e3a;
          line-height: 1.65;
          font-weight: 400;
        }

        .qt-title-block {
          text-align: right;
          padding-top: 4px;
        }

        .qt-title-block h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 700;
          color: #b8845a;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 12px;
        }

        .qt-meta-table {
          font-size: 0.78rem;
          color: #5a3d2b;
          line-height: 1.9;
          text-align: right;
        }

        .qt-meta-table .label {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #7a4f35;
        }

        /* ── DIVIDER STRIP ── */
        .qt-divider {
          height: 3px;
          background: linear-gradient(to right, #c9a07c, #e8c9a8, #c9a07c);
        }

        /* ── BODY ── */
        .qt-body {
          padding: 32px 40px;
          background: #fdf4ef;
        }

        /* ── INFO GRID ── */
        .qt-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        .qt-info-card {
          background: rgba(255,255,255,0.65);
          border: 1px solid #e0c8b4;
          border-radius: 8px;
          padding: 18px 20px;
        }

        .qt-info-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 0.75rem;
          font-weight: 700;
          color: #b8845a;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid #dfc5a9;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }

        .qt-info-card p {
          font-size: 0.82rem;
          color: #3d2010;
          line-height: 1.75;
          font-weight: 400;
        }

        .qt-info-card .strong {
          font-weight: 600;
          color: #2c1810;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 2px;
        }

        /* ── TABLE ── */
        .qt-table-wrap {
          margin-bottom: 28px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #d4b89a;
        }

        .qt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.81rem;
        }

        .qt-table thead tr {
          background: linear-gradient(135deg, #c49a6c, #b07d4e);
        }

        .qt-table thead th {
          color: #fff;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          font-size: 0.72rem;
          padding: 12px 14px;
          text-align: left;
          border: none;
        }

        .qt-table thead th.right { text-align: right; }
        .qt-table thead th.center { text-align: center; }

        .qt-table tbody tr {
          border-bottom: 1px solid #e8d5c1;
        }

        .qt-table tbody tr:nth-child(even) {
          background: rgba(255,255,255,0.55);
        }

        .qt-table tbody tr:nth-child(odd) {
          background: rgba(252,242,232,0.55);
        }

        .qt-table tbody td {
          padding: 11px 14px;
          color: #2c1810;
          vertical-align: top;
          border: none;
        }

        .qt-table tbody td.right { text-align: right; font-variant-numeric: tabular-nums; }
        .qt-table tbody td.center { text-align: center; }

        .qt-table tbody td .item-desc {
          font-weight: 500;
          color: #2c1810;
          display: block;
        }

        .qt-table tbody td .item-note {
          font-size: 0.72rem;
          color: #7a6055;
          display: block;
          margin-top: 2px;
        }

        .qt-table .empty-row td {
          text-align: center;
          padding: 30px;
          color: #a08070;
          font-style: italic;
        }

        /* ── TOTALS ── */
        .qt-totals-wrap {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 32px;
        }

        .qt-totals-card {
          background: rgba(255,255,255,0.65);
          border: 1px solid #e0c8b4;
          border-radius: 8px;
          padding: 18px 24px;
          min-width: 300px;
        }

        .qt-totals-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.83rem;
          color: #4a2e1a;
          padding: 5px 0;
          border-bottom: 1px solid #f0ddd0;
        }

        .qt-totals-row:last-child { border-bottom: none; }
        .qt-totals-row .val { font-variant-numeric: tabular-nums; }

        .qt-totals-row.discount .val { color: #c0392b; }

        .qt-grand-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #c49a6c, #b07d4e);
          border-radius: 6px;
          padding: 12px 16px;
          margin-top: 10px;
          color: #fff;
        }

        .qt-grand-row .label {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .qt-grand-row .val {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        /* ── TERMS ── */
        .qt-terms {
          background: rgba(255,255,255,0.5);
          border: 1px solid #e0c8b4;
          border-radius: 8px;
          padding: 18px 20px;
          margin-bottom: 32px;
        }

        .qt-terms h4 {
          font-family: 'Playfair Display', serif;
          font-size: 0.78rem;
          font-weight: 700;
          color: #b8845a;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
        }

        .qt-terms ol {
          padding-left: 18px;
          font-size: 0.78rem;
          color: #4a2e1a;
          line-height: 1.85;
        }

        /* ── SIGNATURES ── */
        .qt-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 28px;
        }

        .qt-sig-box {
          text-align: center;
        }

        .qt-sig-line {
          border-top: 1px solid #c0a080;
          margin-top: 50px;
          padding-top: 8px;
          font-size: 0.75rem;
          color: #7a5c44;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        /* ── FOOTER ── */
        .qt-footer {
          background: linear-gradient(135deg, #f0e0d0, #e8d0be);
          border-top: 2px solid #c9a07c;
          padding: 16px 40px;
          text-align: center;
          font-size: 0.72rem;
          color: #7a5840;
          line-height: 1.7;
        }

        .qt-footer strong {
          color: #5a3820;
          font-weight: 600;
        }

        .qt-validity-badge {
          display: inline-block;
          background: rgba(196, 154, 108, 0.2);
          border: 1px solid #c49a6c;
          color: #7a4f30;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 20px;
          margin-top: 4px;
          letter-spacing: 0.05em;
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="qt-header">
        <div className="qt-logo-block">
          <img src="/transparent-logo.png" alt="Storyline Design & Events" className="qt-logo-img" />
          <div className="qt-company-block">
            <h2>Storyline Design and Events</h2>
            <p>
              Pune, Maharashtra<br />
              Phone: +91 9518780272, 9307195947<br />
              Email: storylinedesignandevents@gmail.com
            </p>
          </div>
        </div>

        <div className="qt-title-block">
          <h1>Quotation</h1>
          <div className="qt-meta-table">
            <div><span className="label">Quote No: </span>{quote.quoteNumber || `QT-${String(quote.id).padStart(4, '0')}`}</div>
            <div><span className="label">Date: </span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div><span className="label">Valid Until: </span>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 days from issue'}</div>
            <div><span className="label">Version: </span>v{quote.version || 1}</div>
            {quote.status && <div><span className="label">Status: </span>{quote.status}</div>}
          </div>
        </div>
      </div>

      <div className="qt-divider" />

      {/* ── BODY ── */}
      <div className="qt-body">

        {/* Client & Event Info */}
        <div className="qt-info-grid">
          <div className="qt-info-card">
            <h3>Quotation Prepared For</h3>
            <span className="strong">{quote.clientName}</span>
            {quote.clientCompany && <p>{quote.clientCompany}</p>}
            <p style={{ marginTop: '8px', fontSize: '0.78rem', color: '#7a5840' }}>
              This quotation has been prepared exclusively for the above-mentioned client.
            </p>
          </div>

          <div className="qt-info-card">
            <h3>Event Details</h3>
            <span className="strong">{quote.eventName || 'Event Name TBD'}</span>
            <p>
              {quote.eventDate ? (
                <><strong>Date:</strong> {new Date(quote.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}<br /></>
              ) : null}
              {quote.venue ? <><strong>Venue:</strong> {quote.venue}<br /></> : null}
              {quote.pax ? <><strong>Pax:</strong> {quote.pax} guests</> : null}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="qt-table-wrap">
          <table className="qt-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}>#</th>
                <th>Description</th>
                <th className="center" style={{ width: '60px' }}>Qty</th>
                <th className="right" style={{ width: '110px' }}>Unit Price</th>
                <th className="center" style={{ width: '70px' }}>Tax %</th>
                <th className="right" style={{ width: '110px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items && quote.items.length > 0 ? (
                quote.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ color: '#b8845a', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <span className="item-desc">{item.description}</span>
                      {item.notes && <span className="item-note">{item.notes}</span>}
                    </td>
                    <td className="center">{item.quantity}</td>
                    <td className="right">₹{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="center">{item.taxPercent || 0}%</td>
                    <td className="right" style={{ fontWeight: 600 }}>₹{Number(item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan={6}>No line items have been added to this quotation.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="qt-totals-wrap">
          <div className="qt-totals-card">
            <div className="qt-totals-row">
              <span>Subtotal</span>
              <span className="val">₹{Number(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="qt-totals-row">
              <span>GST / Tax</span>
              <span className="val">₹{Number(tax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {discount > 0 && (
              <div className="qt-totals-row discount">
                <span>Discount</span>
                <span className="val">− ₹{Number(discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="qt-grand-row">
              <span className="label">Grand Total</span>
              <span className="val">₹{Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="qt-terms">
          <h4>Terms &amp; Conditions</h4>
          <ol>
            <li>This is an estimation, not a final quotation. Prices may change based on client requirements.</li>
            <li>50% advance payment is compulsory to confirm the booking.</li>
            <li>25% payment is due at the time of execution.</li>
            <li>Remaining 25% payment is due immediately after successful execution.</li>
            <li>This quotation is valid for 30 days from the date of issue.</li>
            <li>Any additional requirements added after confirmation will be billed separately.</li>
          </ol>
        </div>

        {/* Signature Section */}
        <div className="qt-signatures">
          <div className="qt-sig-box">
            <div className="qt-sig-line">Authorised Signatory — Storyline Design &amp; Events</div>
          </div>
          <div className="qt-sig-box">
            <div className="qt-sig-line">Client Acceptance Signature &amp; Stamp</div>
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div className="qt-footer">
        <strong>Storyline Design and Events</strong> | Pune, Maharashtra |
        📞 +91 9518780272, 9307195947 | ✉️ storylinedesignandevents@gmail.com
        <div>
          <span className="qt-validity-badge">Thank you for trusting us with your special occasion</span>
        </div>
      </div>
    </div>
  );
}
