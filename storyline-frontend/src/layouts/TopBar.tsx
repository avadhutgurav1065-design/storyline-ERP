import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/client';
import { useNotification } from '../context/NotificationContext';

interface TopBarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileToggle: () => void;
  title: string;
}

export default function TopBar({ collapsed, onToggle, onMobileToggle, title }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { triggerNotification } = useNotification();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
  
  // Keep track of IDs we have already "rung" the bell for
  const notifiedIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const res = await notificationsApi.getUnreadNotifications();
      const currentUnread = res.data.data || [];
      setUnreadNotifications(currentUnread);
      
      // Check for new ones
      currentUnread.forEach((n: any) => {
        if (!notifiedIds.current.has(n.id)) {
          notifiedIds.current.add(n.id);
          // Play ring and vibrate via our NotificationContext
          const typeMap: any = {
            'TASK_ASSIGNED': 'info',
            'EVENT_PROBLEM': 'error'
          };
          triggerNotification(n.title, n.message, typeMap[n.type] || 'info');
        }
      });
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setUnreadNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnreadNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

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
            {unreadNotifications.length > 0 && (
              <span className="badge">{unreadNotifications.length}</span>
            )}
          </button>
          
          {showNotifications && (
            <div style={{
              position: 'absolute', top: '100%', right: isMobile ? '-60px' : 0, width: isMobile ? '300px' : '320px', backgroundColor: 'var(--bg-card)',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 1000, marginTop: '8px', border: '1px solid var(--border-color)',
              maxHeight: '400px', overflowY: 'auto'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Notifications</span>
                {unreadNotifications.length > 0 && (
                  <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.8rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                    Mark all as read
                  </button>
                )}
              </div>
              
              {unreadNotifications.length === 0 ? (
                <div style={{ padding: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No new notifications.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {unreadNotifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{n.title}</strong>
                        <button onClick={() => handleMarkAsRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }} title="Mark as read">✕</button>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.message}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setShowProfileMenu(!showProfileMenu)}>
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transform: showProfileMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
          </div>

          {showProfileMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: '200px', backgroundColor: 'var(--bg-card)',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 1000, marginTop: '12px', border: '1px solid var(--border-color)',
              display: 'flex', flexDirection: 'column', padding: '8px'
            }}>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                style={{ textAlign: 'left', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                👤 My Profile
              </button>
              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
              <button 
                onClick={logout}
                style={{ textAlign: 'left', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
