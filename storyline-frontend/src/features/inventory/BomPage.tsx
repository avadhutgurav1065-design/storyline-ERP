import { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/client';

export default function BomPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [bomItems, setBomItems] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ rawMaterialId: '', quantity: '' });
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await inventoryApi.listProducts();
        setProducts(res.data.data?.content || res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchMaterials = async () => {
      try {
        const res = await inventoryApi.listMaterials();
        setMaterials(res.data.data?.content || res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
    fetchMaterials();
  }, []);

  const fetchBom = async () => {
    try {
      const res = await inventoryApi.getBom(selectedProductId!);
      setBomItems(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    try {
      await inventoryApi.addBomItem(selectedProductId, {
        rawMaterialId: Number(formData.rawMaterialId),
        quantity: Number(formData.quantity)
      });
      setShowModal(false);
      setFormData({ rawMaterialId: '', quantity: '' });
      fetchBom();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      fetchBom();
    } else {
      setBomItems([]);
    }
  }, [selectedProductId]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bill of Materials (BOM)</h1>
          <p className="page-subtitle">Define the recipes and components for your hampers</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0 }}>Select Product</h3>
          <select 
            className="form-select" 
            onChange={(e) => setSelectedProductId(Number(e.target.value))}
            value={selectedProductId || ''}
          >
            <option value="">-- Choose a Hamper --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
            ))}
          </select>
        </div>
        
        <div className="card" style={{ flex: 2, padding: 0 }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>BOM Components</h3>
            <button className="btn btn-outline btn-sm" disabled={!selectedProductId} onClick={() => setShowModal(true)}>+ Add Component</button>
          </div>
          
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>SKU</th>
                  <th>Required Qty</th>
                  <th>UOM</th>
                </tr>
              </thead>
              <tbody>
                {!selectedProductId ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Please select a product first</td></tr>
                ) : bomItems.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>No BOM defined for this product</td></tr>
                ) : (
                  bomItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.rawMaterialName}</td>
                      <td>{item.rawMaterialSku}</td>
                      <td>{item.quantity}</td>
                      <td>{item.rawMaterialUom}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
      
      {/* Add BOM Component Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Add BOM Component</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddComponent}>
              <div className="form-group">
                <label className="form-label">Raw Material *</label>
                <select className="form-select" required value={formData.rawMaterialId} onChange={e => setFormData({...formData, rawMaterialId: e.target.value})}>
                  <option value="">-- Choose Material --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.sku} - {m.name} ({m.unitOfMeasure})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity Required *</label>
                <input type="number" step="0.01" className="form-input" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Component</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

