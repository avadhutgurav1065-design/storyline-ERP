import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

interface TopBarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileToggle: () => void;
  title: string;
}

export default function TopBar({ collapsed, onToggle, onMobileToggle, title }: TopBarProps) {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <header className="topbar">
      <div className="topbar-left">
        {isMobile ? (
          <button className="topbar-toggle" onClick={onMobileToggle} title="Open Menu">
            ☰
          </button>
        ) : (
          <button className="topbar-toggle" onClick={onToggle} title="Toggle sidebar">
            {collapsed ? '☰' : '✕'}
          </button>
        )}
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="topbar-btn" title="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
            🔔
            <span className="badge">1</span>
          </button>
          
          {showNotifications && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: '300px', backgroundColor: 'var(--card-bg)',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 1000, marginTop: '8px', border: '1px solid var(--border-color)'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Notifications</div>
              <div style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                You have active tasks waiting!
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="user-avatar" title={user?.fullName}>
            {initials}
          </div>
          <div className="user-name-text" style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.roles?.[0]?.replace('_', ' ')}
            </div>
          </div>
          <button className="topbar-btn" onClick={logout} title="Logout">
            🚪
          </button>
        </div>
      </div>
    </header>
  );
}
