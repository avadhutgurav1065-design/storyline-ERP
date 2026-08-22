import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  collapsed: boolean;
  onToggle: () => void;
  title: string;
}

export default function TopBar({ collapsed, onToggle, title }: TopBarProps) {
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-toggle" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? '☰' : '✕'}
        </button>
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <button className="topbar-btn" title="Notifications">
          🔔
          <span className="badge">3</span>
        </button>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="user-avatar" title={user?.fullName}>
            {initials}
          </div>
          <div style={{ lineHeight: 1.2 }}>
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
