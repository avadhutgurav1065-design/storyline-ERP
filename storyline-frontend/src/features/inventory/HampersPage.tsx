import { useState, useEffect, type FormEvent } from 'react';
import { inventoryApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

export default function HampersPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { triggerNotification } = useNotification();

  // Create/Edit Hamper
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    basePrice: '',
  });

  // BOM Management
  const [showBomModal, setShowBomModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [bomItems, setBomItems] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [bomForm, setBomForm] = useState({ rawMaterialId: '', quantity: '' });

  // Produce Hamper
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [produceForm, setProduceForm] = useState({ quantity: '1', reference: '' });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.listProducts();
      console.log('PRODUCTS RESPONSE:', res.data);
      let pData = res.data.data;
      if (pData && pData.content) pData = pData.content;
      setProducts(Array.isArray(pData) ? pData : (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to fetch hampers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const res = await inventoryApi.listMaterials();
      setRawMaterials(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchRawMaterials();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if ((formData as any).id) {
        await inventoryApi.updateProduct((formData as any).id, {
          ...formData,
          basePrice: parseFloat(formData.basePrice)
        });
      } else {
        await inventoryApi.createProduct({
          ...formData,
          basePrice: parseFloat(formData.basePrice)
        });
      }
      triggerNotification('Success', 'Hamper saved', 'success');
      setShowModal(false);
      setFormData({ sku: '', name: '', description: '', basePrice: '' } as any);
      fetchProducts();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to save hamper', 'error');
    }
  };

  const handleOpenBom = async (product: any) => {
    setSelectedProduct(product);
    setShowBomModal(true);
    try {
      const res = await inventoryApi.getBom(product.id);
      setBomItems(res.data.data || []);
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to fetch BOM', 'error');
    }
  };

  const handleAddBomItem = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.addBomItem(selectedProduct.id, {
        rawMaterialId: parseInt(bomForm.rawMaterialId),
        quantity: parseFloat(bomForm.quantity)
      });
      triggerNotification('Success', 'BOM item added', 'success');
      setBomForm({ rawMaterialId: '', quantity: '' });
      handleOpenBom(selectedProduct);
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to add BOM item', 'error');
    }
  };

  const handleRemoveBomItem = async (bomId: number) => {
    try {
      await inventoryApi.removeBomItem(bomId);
      triggerNotification('Success', 'BOM item removed', 'success');
      handleOpenBom(selectedProduct);
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to remove BOM item', 'error');
    }
  };

  const handleProduce = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.produceHamper(selectedProduct.id, {
        quantity: parseInt(produceForm.quantity),
        reference: produceForm.reference
      });
      triggerNotification('Success', 'Hamper produced successfully! Stock deducted.', 'success');
      setShowProduceModal(false);
      setProduceForm({ quantity: '1', reference: '' });
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to produce hamper (insufficient stock?)';
      triggerNotification('Error', msg, 'error');
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">🎁 Hamper Catalog</h1>
          <p className="page-subtitle">Manage products, pricing, Bill of Materials, and Production</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Hamper</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Hamper Name</th>
              <th>Description</th>
              <th>Base Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading products...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No hampers found</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{product.sku}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                  </td>
                  <td>{product.description || '—'}</td>
                  <td>₹{product.basePrice?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        title="Edit"
                        onClick={() => {
                          setFormData({
                            id: product.id,
                            sku: product.sku,
                            name: product.name,
                            description: product.description || '',
                            basePrice: product.basePrice?.toString() || ''
                          } as any);
                          setShowModal(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleOpenBom(product)}>BOM</button>
                      <button className="btn btn-primary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => {
                        setSelectedProduct(product);
                        setShowProduceModal(true);
                      }}>🔨 Produce</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">{(formData as any).id ? 'Edit Hamper' : 'Create New Hamper'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input className="form-input" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. HMP-WED-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Royal Wedding Hamper" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Base Price (₹) *</label>
                <input type="number" step="0.01" className="form-input" required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOM Modal */}
      {showBomModal && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
            <div className="card-header">
              <div className="card-title">Bill of Materials: {selectedProduct.name}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBomModal(false)}>✕</button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px' }}>Material</th>
                    <th style={{ padding: '8px 4px' }}>Unit</th>
                    <th style={{ padding: '8px 4px' }}>Qty Required</th>
                    <th style={{ padding: '8px 4px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bomItems.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '10px', textAlign: 'center', color: 'var(--text-secondary)' }}>No items in BOM</td></tr>
                  ) : (
                    bomItems.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 4px' }}>{item.rawMaterial?.name}</td>
                        <td style={{ padding: '8px 4px' }}>{item.rawMaterial?.unitOfMeasure}</td>
                        <td style={{ padding: '8px 4px' }}>{item.quantity}</td>
                        <td style={{ padding: '8px 4px' }}>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-color)' }} onClick={() => handleRemoveBomItem(item.id)}>Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '10px' }}>Add Material to BOM</h4>
            <form onSubmit={handleAddBomItem} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Raw Material</label>
                <select className="form-input" required value={bomForm.rawMaterialId} onChange={e => setBomForm({...bomForm, rawMaterialId: e.target.value})}>
                  <option value="">Select Material...</option>
                  {rawMaterials.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name} ({rm.unitOfMeasure})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ width: '100px', marginBottom: 0 }}>
                <label className="form-label">Qty</label>
                <input type="number" step="0.1" className="form-input" required value={bomForm.quantity} onChange={e => setBomForm({...bomForm, quantity: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>Add</button>
            </form>
          </div>
        </div>
      )}

      {/* Produce Modal */}
      {showProduceModal && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header">
              <div className="card-title">Produce: {selectedProduct.name}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowProduceModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Producing this hamper will automatically deduct the required raw materials from inventory based on the BOM.
            </p>
            <form onSubmit={handleProduce}>
              <div className="form-group">
                <label className="form-label">Quantity to Produce *</label>
                <input type="number" min="1" className="form-input" required value={produceForm.quantity} onChange={e => setProduceForm({...produceForm, quantity: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Reference / Note</label>
                <input className="form-input" value={produceForm.reference} onChange={e => setProduceForm({...produceForm, reference: e.target.value})} placeholder="e.g. For Wedding A" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProduceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Produce & Deduct Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
