import { useState } from 'react';

export default function TeamManagementPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Assign team members to events</p>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👷</div>
        <h3>Select an Event to manage its Team</h3>
        <p>Teams are assigned per-event. Navigate to an active event to assign roles like Event Head, Decoration Head, etc.</p>
      </div>
    </div>
  );
}
