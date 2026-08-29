import { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { triggerNotification } = useNotification();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ sku: '', name: '', unitOfMeasure: 'pcs', minimumStock: '0' });

  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedRm, setSelectedRm] = useState<any>(null);
  const [stockData, setStockData] = useState({ quantity: '', reference: '', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.listMaterials({ size: 100 });
      setMaterials(res.data.data?.content || res.data.data || []);
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to fetch raw materials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.createMaterial({
        ...formData,
        minimumStock: parseFloat(formData.minimumStock)
      });
      triggerNotification('Success', 'Raw material added', 'success');
      setShowAddModal(false);
      setFormData({ sku: '', name: '', unitOfMeasure: 'pcs', minimumStock: '0' });
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to add raw material', 'error');
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRm) return;
    try {
      await inventoryApi.addStock(selectedRm.id, {
        quantity: parseFloat(stockData.quantity),
        type: 'IN',
        reference: stockData.reference,
        notes: stockData.notes
      });
      triggerNotification('Success', 'Stock added successfully', 'success');
      setShowStockModal(false);
      setStockData({ quantity: '', reference: '', notes: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to add stock', 'error');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Raw Materials...</div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">📦 Raw Materials</h1>
          <p className="page-subtitle">Manage inventory items for Hamper production</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ New Material</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No raw materials found.</td></tr>
            ) : (
              materials.map(rm => (
                <tr key={rm.id}>
                  <td style={{ fontWeight: 600 }}>{rm.sku}</td>
                  <td>{rm.name}</td>
                  <td>{rm.unitOfMeasure}</td>
                  <td style={{ fontWeight: 'bold' }}>{rm.currentStock}</td>
                  <td>{rm.minimumStock}</td>
                  <td>
                    {rm.currentStock <= rm.minimumStock ? (
                      <span className="badge badge-danger">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">OK</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => {
                      setSelectedRm(rm);
                      setShowStockModal(true);
                    }}>+ Add Stock</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header">
              <div className="card-title">Add Raw Material</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddMaterial}>
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input className="form-input" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. RM-BOX-001" />
              </div>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Cardboard Box" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <input className="form-input" required value={formData.unitOfMeasure} onChange={e => setFormData({...formData, unitOfMeasure: e.target.value})} placeholder="pcs, kg, m" />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Stock *</label>
                  <input type="number" step="0.1" className="form-input" required value={formData.minimumStock} onChange={e => setFormData({...formData, minimumStock: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStockModal && selectedRm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header">
              <div className="card-title">Add Stock: {selectedRm.name}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowStockModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddStock}>
              <div className="form-group">
                <label className="form-label">Quantity to Add ({selectedRm.unitOfMeasure}) *</label>
                <input type="number" step="0.1" className="form-input" required value={stockData.quantity} onChange={e => setStockData({...stockData, quantity: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Vendor / Reference</label>
                <input className="form-input" value={stockData.reference} onChange={e => setStockData({...stockData, reference: e.target.value})} placeholder="PO-1234 or Vendor Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" value={stockData.notes} onChange={e => setStockData({...stockData, notes: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
