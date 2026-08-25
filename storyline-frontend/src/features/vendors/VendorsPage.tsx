import { useState, useEffect } from 'react';
import { vendorsApi } from '../../api/client';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      if (editingId) {
        await vendorsApi.update(editingId, formData);
      } else {
        await vendorsApi.create(formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', serviceType: '', phone: '', email: '', address: '' });
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (vendor: any) => {
    setFormData({
      name: vendor.name,
      serviceType: vendor.serviceType || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || ''
    });
    setEditingId(vendor.id);
    setShowModal(true);
  };

  const filteredVendors = vendors.filter(v => {
    const q = searchQuery.toLowerCase();
    return (v.name?.toLowerCase().includes(q) || 
            v.serviceType?.toLowerCase().includes(q) || 
            v.address?.toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Vendor Contact Book</h1>
          <p className="page-subtitle">Search and manage your vendors</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingId(null);
          setFormData({ name: '', serviceType: '', phone: '', email: '', address: '' });
          setShowModal(true);
        }}>+ Add Vendor</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search by name, work description, or city (e.g. 'sound pune')" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', maxWidth: '600px', padding: '12px' }}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Vendor Name & City</th>
                <th>Work Description</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Loading contacts...</td></tr>
              ) : filteredVendors.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>No vendors found</td></tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td data-label="Vendor">
                      <div style={{ fontWeight: 600 }}>{vendor.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{vendor.address || '—'}</div>
                    </td>
                    <td data-label="Work">
                      <span className="badge badge-info">{vendor.serviceType || 'General'}</span>
                    </td>
                    <td data-label="Phone">
                      <div style={{ fontWeight: 600 }}>{vendor.phone}</div>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {vendor.phone && (
                          <a href={`tel:${vendor.phone}`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                            📞 Call Now
                          </a>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(vendor)}>
                          ✏️ Edit
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">{editingId ? 'Edit Vendor Contact' : 'Add New Vendor Contact'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Vendor Name *</label>
                  <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Description (e.g. Sound, Lights) *</label>
                  <input className="form-input" required value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Contact' : 'Save Contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
