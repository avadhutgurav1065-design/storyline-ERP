import { useState, useEffect } from 'react';
import { inventoryApi, eventsApi } from '../../api/client';

export default function DispatchPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    eventId: '',
    productId: '',
    quantity: '1',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, productsRes] = await Promise.all([
          eventsApi.listEvents({ size: 100 }), // Get all active events ideally
          inventoryApi.listProducts({ size: 100 })
        ]);
        setEvents(eventsRes.data.data.content || []);
        setProducts(productsRes.data.data.content || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await inventoryApi.dispatchToEvent({
        eventId: Number(formData.eventId),
        items: [
          {
            productId: Number(formData.productId),
            quantity: Number(formData.quantity)
          }
        ],
        notes: formData.notes
      });
      setMessage('Products dispatched successfully!');
      setFormData(prev => ({ ...prev, productId: '', quantity: '1', notes: '' }));
      
      // Refresh product stock display
      const productsRes = await inventoryApi.listProducts({ size: 100 });
      setProducts(productsRes.data.data.content || []);
      
    } catch (err: any) {
      setMessage(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === Number(formData.productId));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dispatch Operations</h1>
          <p className="page-subtitle">Assign hampers and goods to specific events</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h3 style={{ marginTop: 0 }}>Create Dispatch Order</h3>
        
        {message && (
          <div style={{ padding: '12px', marginBottom: '16px', borderRadius: '6px', 
            backgroundColor: message.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            color: message.startsWith('Error') ? 'var(--danger)' : 'var(--success)'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleDispatch}>
          <div className="form-group">
            <label className="form-label">Select Event *</label>
            <select 
              className="form-select" 
              required
              value={formData.eventId}
              onChange={(e) => setFormData({...formData, eventId: e.target.value})}
            >
              <option value="">Choose an Event...</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.status})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Select Product (Hamper) *</label>
              <select 
                className="form-select" 
                required
                value={formData.productId}
                onChange={(e) => setFormData({...formData, productId: e.target.value})}
              >
                <option value="">Choose a Product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input 
                type="number" 
                min="1"
                className="form-input" 
                required
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
          </div>

          {selectedProduct && (
            <div style={{ fontSize: '0.85rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
              Current Available Stock: <strong style={{ color: selectedProduct.currentStock < Number(formData.quantity) ? 'var(--danger)' : 'var(--success)' }}>{selectedProduct.currentStock}</strong>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Dispatch Notes</label>
            <textarea 
              className="form-input" 
              placeholder="e.g., Driver name, delivery vehicle number..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              style={{ minHeight: '80px' }}
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading || !formData.eventId || !formData.productId}
          >
            {loading ? 'Processing...' : 'Confirm Dispatch'}
          </button>
        </form>
      </div>
    </div>
  );
}
