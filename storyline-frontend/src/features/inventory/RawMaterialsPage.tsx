import { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/client';

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    sku: '', name: '', unitOfMeasure: '', currentStock: '', minimumStock: ''
  });

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.listRawMaterials();
      setMaterials(res.data.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        currentStock: Number(formData.currentStock),
        minimumStock: Number(formData.minimumStock)
      };
      
      if ((formData as any).id) {
        await inventoryApi.updateRawMaterial((formData as any).id, payload);
      } else {
        await inventoryApi.createRawMaterial(payload);
      }
      setShowModal(false);
      setFormData({ sku: '', name: '', unitOfMeasure: '', currentStock: '', minimumStock: '' } as any);
      fetchMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Raw Materials</h1>
          <p className="page-subtitle">Track individual components, ribbons, baskets, and perishables</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Material</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Material Name</th>
                <th>Unit of Measure</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading materials...</td></tr>
              ) : materials.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No raw materials found</td></tr>
              ) : (
                materials.map((m) => (
                  <tr key={m.id}>
                    <td><div style={{ fontWeight: 600 }}>{m.sku}</div></td>
                    <td>{m.name}</td>
                    <td>{m.unitOfMeasure}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: m.currentStock <= m.minimumStock ? 'var(--danger)' : 'inherit' }}>
                        {m.currentStock}
                      </div>
                    </td>
                    <td>{m.minimumStock}</td>
                    <td>
                      {m.currentStock <= m.minimumStock ? (
                        <span className="badge badge-danger">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        title="Edit"
                        onClick={() => {
                          setFormData({
                            id: m.id,
                            sku: m.sku,
                            name: m.name,
                            unitOfMeasure: m.unitOfMeasure,
                            currentStock: m.currentStock?.toString() || '0',
                            minimumStock: m.minimumStock?.toString() || '0'
                          } as any);
                          setShowModal(true);
                        }}
                      >
                        ✏️
                      </button>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">{(formData as any).id ? 'Edit Material' : 'Add Raw Material'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input className="form-input" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. MAT-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Red Ribbon" />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit of Measure *</label>
                  <input className="form-input" required value={formData.unitOfMeasure} onChange={e => setFormData({...formData, unitOfMeasure: e.target.value})} placeholder="e.g. meters, pcs" />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Stock *</label>
                  <input type="number" className="form-input" required value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Stock *</label>
                  <input type="number" className="form-input" required value={formData.minimumStock} onChange={e => setFormData({...formData, minimumStock: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Material</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

