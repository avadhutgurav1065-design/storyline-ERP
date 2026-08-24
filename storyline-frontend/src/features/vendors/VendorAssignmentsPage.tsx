import { useState, useEffect } from 'react';
import { vendorAssignmentsApi } from '../../api/client';

export default function VendorAssignmentsPage() {
  // In a real app, you'd select an event first, but for now we list placeholders or fetch all 
  // since the API is by eventId. We'll just show a placeholder layout if no event is selected.
  
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor Assignments</h1>
          <p className="page-subtitle">Track vendor tasks and costs across events</p>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
        <h3>Select an Event to view assignments</h3>
        <p>Vendor assignments are tracked per-event. Navigate to an event to manage its vendors.</p>
      </div>
    </div>
  );
}
