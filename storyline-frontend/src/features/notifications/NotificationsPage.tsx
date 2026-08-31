import { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { triggerNotification } = useNotification();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getMyNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    if (!type) return '🔔';
    switch (type.toUpperCase()) {
      case 'ALERT': return '⚠️';
      case 'FINANCE': return '💰';
      case 'EVENT': return '🎪';
      case 'CRM': return '👤';
      case 'TASK_ASSIGNED': return '✅';
      case 'TEAM_ASSIGNED': return '🎯';
      default: return '🔔';
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Recent activity and alerts across your organization</p>
        </div>
        <button className="btn btn-ghost" onClick={markAllAsRead} disabled={loading || notifications.every(n => n.read)}>
          Mark All as Read
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No notifications found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notif, idx) => (
              <div 
                key={notif.id}
                onClick={() => !notif.read && markAsRead(notif.id)}
                style={{ 
                  padding: '20px', 
                  borderBottom: idx === notifications.length - 1 ? 'none' : '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                  backgroundColor: notif.read ? 'transparent' : '#f8fafc',
                  cursor: notif.read ? 'default' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                className={!notif.read ? 'hover-row' : ''}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {getIcon(notif.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontWeight: notif.read ? 500 : 700, color: 'var(--text-color)' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {notif.message}
                  </div>
                </div>
                {!notif.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }}></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

