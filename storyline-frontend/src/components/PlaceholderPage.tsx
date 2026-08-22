interface PlaceholderProps {
  title: string;
  description: string;
  icon: string;
  phase: string;
}

export default function PlaceholderPage({ title, description, icon, phase }: PlaceholderProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        background: 'var(--primary-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        marginBottom: '24px',
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '16px' }}>
        {description}
      </p>
      <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
        {phase}
      </span>
    </div>
  );
}
