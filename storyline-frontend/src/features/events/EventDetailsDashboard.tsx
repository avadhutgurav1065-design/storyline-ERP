import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../api/client';

export default function EventDetailsDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', role: '', department: '', isHead: false });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedUserId: '', priority: 'MEDIUM', dueDate: '' });

  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorForm, setVendorForm] = useState({ vendorId: '', task: '', agreedAmount: '' });

  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({ name: '', documentType: 'GUEST_LIST', fileUrl: '' });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.getEventDashboard(Number(id));
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [id]);

  const handleAssignSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${id}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(assignForm.userId),
          role: assignForm.role,
          department: assignForm.department,
          isHead: assignForm.isHead
        })
      });
      if (res.ok) {
        setShowAssignModal(false);
        setAssignForm({ userId: '', role: '', department: '', isHead: false });
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { tasksApi } = await import('../../api/client');
      await tasksApi.create({
        eventId: Number(id),
        ...taskForm,
        assignedUserId: taskForm.assignedUserId ? Number(taskForm.assignedUserId) : null,
      });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedUserId: '', priority: 'MEDIUM', dueDate: '' });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVendorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { vendorAssignmentsApi } = await import('../../api/client');
      await vendorAssignmentsApi.assign({
        eventId: Number(id),
        vendorId: Number(vendorForm.vendorId),
        task: vendorForm.task,
        agreedAmount: vendorForm.agreedAmount ? parseFloat(vendorForm.agreedAmount) : 0,
        status: 'ASSIGNED'
      });
      setShowVendorModal(false);
      setVendorForm({ vendorId: '', task: '', agreedAmount: '' });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm)
      });
      if (res.ok) {
        setShowDocModal(false);
        setDocForm({ name: '', documentType: 'GUEST_LIST', fileUrl: '' });
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocForm({ ...docForm, fileUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTaskStatus = async (taskId: number, currentStatus: string) => {
    try {
      const { tasksApi } = await import('../../api/client');
      const newStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      await tasksApi.update(taskId, { status: newStatus });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Event Command Center...</div>;
  if (!data || !data.event) return <div style={{ padding: '40px', textAlign: 'center' }}>Event not found.</div>;

  const { event, tasks, vendorAssignments, teamAssignments, documents, progress } = data;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '10px' }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events/active')} style={{ marginBottom: '10px' }}>← Back to Events</button>
          <h1 className="page-title">{event.name}</h1>
          <p className="page-subtitle">
            {event.startDate} to {event.endDate} | Venue: {event.venue || 'TBD'}
          </p>
        </div>
        <span className={`badge ${event.status === 'COMPLETED' ? 'badge-success' : 'badge-primary'}`} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          {event.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid var(--border)', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        {['OVERVIEW', 'TEAM', 'CHECKLIST', 'VENDORS', 'DOCUMENTS'].map(tab => (
          <div 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              fontWeight: 600, 
              padding: '8px 16px', 
              cursor: 'pointer', 
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              marginBottom: '-7px'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="animate-fade-in">
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Overall Progress</span>
              <span style={{ fontWeight: 600 }}>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>Quick Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{tasks?.length || 0}</div>
              </div>
              <div style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Team Members</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{teamAssignments?.length || 0}</div>
              </div>
              <div style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vendors</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{vendorAssignments?.length || 0}</div>
              </div>
              <div style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Documents</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{documents?.length || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TEAM' && (
        <div className="animate-fade-in card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>👥 Hierarchical Team</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAssignModal(true)}>+ Assign Member</button>
          </div>
          {teamAssignments && teamAssignments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teamAssignments.map((ta: any) => (
                <div key={ta.id} style={{ padding: '15px', background: 'var(--background)', borderRadius: '8px', borderLeft: ta.isHead ? '4px solid var(--primary)' : '4px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>User ID: {ta.userId} {ta.isHead && <span className="badge badge-primary" style={{ marginLeft: '10px' }}>Head</span>}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dept: {ta.department || 'General'} | Role: {ta.role}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={async () => {
                      await fetch(`/api/events/team/${ta.id}`, { method: 'DELETE' });
                      fetchDashboard();
                    }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No team members assigned yet.</div>
          )}
        </div>
      )}

      {activeTab === 'CHECKLIST' && (
        <div className="animate-fade-in card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <div className="card-title">📝 Event Checklist & Tasks</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
          </div>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {tasks && tasks.length > 0 ? (
                  tasks.map((task: any) => (
                    <tr key={task.id} style={{ opacity: task.status === 'COMPLETED' ? 0.6 : 1 }}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={task.status === 'COMPLETED'} 
                          onChange={() => toggleTaskStatus(task.id, task.status)}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }} 
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>{task.title}</div>
                        {task.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.description}</div>}
                      </td>
                      <td>{task.assignedUserId ? `User ${task.assignedUserId}` : 'Unassigned'}</td>
                      <td>{task.dueDate || '-'}</td>
                      <td>
                        <span className={`badge ${task.priority === 'HIGH' ? 'badge-danger' : task.priority === 'MEDIUM' ? 'badge-warning' : 'badge-ghost'}`}>
                          {task.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No tasks on checklist.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'VENDORS' && (
        <div className="animate-fade-in card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>🎪 Event Vendors</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowVendorModal(true)}>+ Assign Vendor</button>
          </div>
          {vendorAssignments && vendorAssignments.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
              {vendorAssignments.map((va: any) => (
                <div key={va.id} style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '5px' }}>{va.vendor?.name || `Vendor ID: ${va.vendorId}`}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 500 }}>Task: {va.task}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Agreed Amt: ₹{va.agreedAmount}</div>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <a href={`tel:${va.vendor?.phone}`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>📞 Call Now</a>
                    <a href={`https://wa.me/${va.vendor?.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>💬 WhatsApp</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No vendors assigned yet.</div>
          )}
        </div>
      )}

      {activeTab === 'DOCUMENTS' && (
        <div className="animate-fade-in card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>📄 Document Hub</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDocModal(true)}>+ Upload Document</button>
          </div>
          {documents && documents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {documents.map((doc: any) => (
                <div key={doc.id} style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ fontSize: '2rem' }}>{doc.documentType === 'GUEST_LIST' ? '📋' : doc.documentType === 'DECOR' ? '✨' : '📄'}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{doc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.documentType}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => {
                      const a = document.createElement('a');
                      a.href = doc.fileUrl;
                      a.download = doc.name;
                      a.click();
                    }}>Download</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={async () => {
                      await fetch(`/api/events/documents/${doc.id}`, { method: 'DELETE' });
                      fetchDashboard();
                    }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No documents uploaded yet.</div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Assign Team Member</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">User ID *</label>
                <input type="number" className="form-input" required value={assignForm.userId} onChange={e => setAssignForm({...assignForm, userId: e.target.value})} placeholder="e.g. 1" />
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select className="form-select" required value={assignForm.department} onChange={e => setAssignForm({...assignForm, department: e.target.value})}>
                  <option value="">Select Dept...</option>
                  <option value="HOSPITALITY">Hospitality</option>
                  <option value="DECOR">Decor</option>
                  <option value="LOGISTICS">Logistics</option>
                  <option value="PRODUCTION">Production</option>
                  <option value="SOUND_LIGHT">Sound & Light</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Role Title *</label>
                <input className="form-input" required value={assignForm.role} onChange={e => setAssignForm({...assignForm, role: e.target.value})} placeholder="e.g. Hospitality Executive" />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={assignForm.isHead} onChange={e => setAssignForm({...assignForm, isHead: e.target.checked})} />
                <label className="form-label" style={{ margin: 0 }}>Is Department Head?</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Create Checklist Task</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input className="form-input" required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} placeholder="e.g., Finalize Menu" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Assign To (User ID)</label>
                  <input type="number" className="form-input" value={taskForm.assignedUserId} onChange={e => setTaskForm({...taskForm, assignedUserId: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVendorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Assign Vendor</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowVendorModal(false)}>✕</button>
            </div>
            <form onSubmit={handleVendorSubmit}>
              <div className="form-group">
                <label className="form-label">Vendor ID *</label>
                <input type="number" className="form-input" required value={vendorForm.vendorId} onChange={e => setVendorForm({...vendorForm, vendorId: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Task / Service Description *</label>
                <input className="form-input" required value={vendorForm.task} onChange={e => setVendorForm({...vendorForm, task: e.target.value})} placeholder="e.g., Stage Setup" />
              </div>
              <div className="form-group">
                <label className="form-label">Agreed Amount (₹)</label>
                <input type="number" className="form-input" value={vendorForm.agreedAmount} onChange={e => setVendorForm({...vendorForm, agreedAmount: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowVendorModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDocModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Upload Event Document</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDocModal(false)}>✕</button>
            </div>
            <form onSubmit={handleDocSubmit}>
              <div className="form-group">
                <label className="form-label">Document Name *</label>
                <input className="form-input" required value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} placeholder="e.g., Final Guest List" />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-select" required value={docForm.documentType} onChange={e => setDocForm({...docForm, documentType: e.target.value})}>
                  <option value="GUEST_LIST">Guest List</option>
                  <option value="DECOR">Decor Plan</option>
                  <option value="SEATING">Seating Chart</option>
                  <option value="SCHEDULE">Event Schedule</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Select File *</label>
                <input type="file" className="form-input" required onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!docForm.fileUrl}>Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

