import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo.jpg" alt="Storyline ERP Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1>Storyline ERP</h1>
          <p>Event Management System</p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            marginBottom: '20px',
            background: 'var(--danger-50)',
            color: 'var(--danger-600)',
            borderRadius: 'var(--border-radius)',
            fontSize: '0.85rem',
            fontWeight: 500,
            border: '1px solid var(--danger-100)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@storyline.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {deferredPrompt && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              onClick={handleInstallClick}
              style={{
                background: '#10B981',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%'
              }}
            >
              📱 Install App on Phone
            </button>
          </div>
        )}

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          Storyline Event Management ERP v1.0
        </p>
      </div>
    </div>
  );
}
