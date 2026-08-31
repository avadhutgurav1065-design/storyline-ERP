import { useState, useEffect } from 'react';
import { vendorsApi } from '../../api/client';
import { Search, Plus, PhoneCall, Mail } from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', serviceType: '', phone: '', email: '', address: ''
  });

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorsApi.list();
      setVendors(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.content || []));
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
    <div className="page-container animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Vendor Contact Book</h1>
          <p className="page-subtitle">Search and manage your external vendors</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingId(null);
          setFormData({ name: '', serviceType: '', phone: '', email: '', address: '' });
          setShowModal(true);
        }}>
          <Plus size={18} /> Add Vendor
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input hover-scale"
            placeholder="Search by name, work description, or city (e.g. 'sound pune')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, border: 'none', background: 'transparent' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="interactive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Vendor Name & City</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Work Description</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Phone Number</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Loading contacts...</td></tr>
              ) : filteredVendors.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>No vendors found</td></tr>
              ) : (
                filteredVendors.map((vendor) => {
                  const avatarColor = ['#E0F2FE', '#FEF08A', '#BBF7D0', '#FCE7F3'][vendor.id % 4] || '#F3F4F6';
                  const textColor = ['#0284C7', '#854D0E', '#166534', '#DB2777'][vendor.id % 4] || '#9CA3AF';

                  return (
                    <tr key={vendor.id} className="hover-row" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px' }} data-label="Vendor">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="avatar" style={{ background: avatarColor, color: textColor, width: 40, height: 40, fontSize: '1rem' }}>
                            {vendor.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{vendor.name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{vendor.address || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }} data-label="Service">
                        <span className="badge-pastel blue">{vendor.serviceType || 'General'}</span>
                      </td>
                      <td style={{ padding: '16px' }} data-label="Phone">
                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PhoneCall size={14} color="var(--text-muted)" /> {vendor.phone}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }} data-label="Actions">
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                          {vendor.phone && (
                            <a href={`tel:${vendor.phone}`} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                              <PhoneCall size={14} /> Call Now
                            </a>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(vendor)}>
                            ✏️ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
                  <input className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Description (e.g. Sound, Lights) *</label>
                  <input className="form-input" required value={formData.serviceType} onChange={e => setFormData({ ...formData, serviceType: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
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

