export default function NotificationsPage() {
  const dummyNotifications = [
    {
      id: 1,
      type: 'ALERT',
      title: 'Low Stock Alert',
      message: 'Red Ribbon stock is below minimum required level.',
      time: '10 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'FINANCE',
      title: 'Payment Received',
      message: 'Received ₹50,000 via Bank Transfer for Invoice INV-2026-001.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'EVENT',
      title: 'New Event Assigned',
      message: 'You have been assigned as Event Head for "Royal Wedding Gala".',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'CRM',
      title: 'New Lead Registered',
      message: 'A new lead from Website Contact Form needs follow-up.',
      time: '1 day ago',
      read: true
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT': return '⚠️';
      case 'FINANCE': return '💰';
      case 'EVENT': return '🎪';
      case 'CRM': return '👤';
      default: return '🔔';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Recent activity and alerts across your organization</p>
        </div>
        <button className="btn btn-ghost">Mark All as Read</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {dummyNotifications.map((notif, idx) => (
            <div 
              key={notif.id} 
              style={{ 
                padding: '20px', 
                borderBottom: idx === dummyNotifications.length - 1 ? 'none' : '1px solid var(--border)',
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                backgroundColor: notif.read ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)'
              }}
            >
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'var(--background)',
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
                  <div style={{ fontWeight: notif.read ? 500 : 700, color: 'var(--text)' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.time}</div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {notif.message}
                </div>
              </div>
              {!notif.read && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

