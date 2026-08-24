import { useState } from 'react';

export default function EventCalendarPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Calendar</h1>
          <p className="page-subtitle">Schedule view of all upcoming events</p>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
        <h3>Calendar View</h3>
        <p>A full calendar component will be integrated here showing event dates, load-ins, and deadlines.</p>
      </div>
    </div>
  );
}
