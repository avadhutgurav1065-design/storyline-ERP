import { useState, useEffect, type FormEvent } from 'react';
import { crmApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await crmApi.listClients({ search });
      setClients(res.data.data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Management</h1>
          <p className="page-subtitle">Manage your converted clients and billing details</p>
        </div>
        <button className="btn btn-primary">+ New Client</button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <input
          type="text" className="form-input" placeholder="Search clients by name, email, or company..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Contact Details</th>
                <th>Company</th>
                <th>GST Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading clients...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No clients found</td></tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', background: 'var(--success-500)' }}>
                          {client.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600 }}>{client.name}</div>
                      </div>
                    </td>
                    <td>
                      <div>{client.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email || '—'}</div>
                    </td>
                    <td>{client.company || '—'}</td>
                    <td>{client.gstNumber || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" title="Edit">✏️</button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/quotations?clientId=${client.id}`)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Quotations
                        </button>
                      </div>
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
