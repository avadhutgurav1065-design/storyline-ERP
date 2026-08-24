import { useState, useEffect } from 'react';
import { vendorsApi } from '../../api/client';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', serviceType: '', phone: '', email: '', address: ''
  });

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorsApi.list();
      setVendors(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorsApi.create(formData);
      setShowModal(false);
      setFormData({ name: '', serviceType: '', phone: '', email: '', address: '' });
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor Management</h1>
          <p className="page-subtitle">Manage vendors, their services, and contact details</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Vendor</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Service Type</th>
                <th>Contact Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading vendors...</td></tr>
              ) : vendors.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No vendors found</td></tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{vendor.name}</div>
                    </td>
                    <td><span className="badge badge-info">{vendor.serviceType || 'General'}</span></td>
                    <td>
                      <div>{vendor.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vendor.email || '—'}</div>
                    </td>
                    <td>
                      <span className={`badge ${vendor.active ? 'badge-success' : 'badge-danger'}`}>
                        {vendor.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" title="Edit">✏️</button>
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
              <div className="card-title">Add New Vendor</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Vendor Name *</label>
                  <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Service Type (e.g., Decorator, Caterer) *</label>
                  <input className="form-input" required value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Address</label>
                  <textarea className="form-input" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
