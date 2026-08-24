import { useState, useEffect } from 'react';
import { salesApi } from '../../api/client';
import { useSearchParams } from 'react-router-dom';

export default function QuotationHistoryPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await salesApi.listQuotations({ search });
      setQuotations(res.data.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [search]);

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
                // Ideally update URL search params here
                window.history.pushState({}, '', `/quotation-history?q=${val}`);
                // Trigger a re-fetch manually or rely on a state variable instead of just searchParams if we want instant search
                fetchQuotations(); 
              }
            }}
          />
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Quote No.</th>
                <th>Client ID</th>
                <th>Event Details</th>
                <th>Version</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading history...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No quotation history found</td></tr>
              ) : (
                quotations.map((quote) => (
                  <tr key={quote.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{quote.quoteNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quote.createdAt?.substring(0,10)}</div>
                    </td>
                    <td>Client #{quote.clientId}</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
