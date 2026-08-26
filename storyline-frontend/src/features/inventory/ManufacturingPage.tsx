import { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/client';

export default function ManufacturingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await inventoryApi.listProducts();
        setProducts(res.data.data.content || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleManufacture = async () => {
    if (!selectedProductId || !quantity) return;
    setLoading(true);
    setMessage('');
    try {
      await inventoryApi.processManufactureBatch({
        productId: Number(selectedProductId),
        quantityToManufacture: Number(quantity)
      });
      setMessage('Manufacturing batch processed successfully! Raw materials deducted and product stock increased.');
      setQuantity('1');
    } catch (err: any) {
      setMessage(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manufacturing Batches</h1>
          <p className="page-subtitle">Assemble hampers from raw materials to increase finished goods stock</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ marginTop: 0 }}>Start New Batch</h3>
        
        {message && (
          <div style={{ padding: '12px', marginBottom: '16px', borderRadius: '6px', 
            backgroundColor: message.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            color: message.startsWith('Error') ? 'var(--danger)' : 'var(--success)'
          }}>
            {message}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Product (Hamper) to Manufacture</label>
          <select 
            className="form-select" 
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select a product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Quantity to Produce</label>
          <input 
            type="number" 
            min="1" 
            className="form-input" 
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '10px' }}
          onClick={handleManufacture}
          disabled={loading || !selectedProductId}
        >
          {loading ? 'Processing...' : 'Execute Manufacturing Batch'}
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center' }}>
          Warning: This action is irreversible. It will strictly deduct raw materials according to the BOM. If stock is insufficient, it will throw an error.
        </p>
      </div>
    </div>
  );
}

