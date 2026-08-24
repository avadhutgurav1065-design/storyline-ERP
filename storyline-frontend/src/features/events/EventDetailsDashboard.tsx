import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../api/client';

export default function EventDetailsDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // For updating team/head assignments
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ eventHeadId: '', assignedTeamId: '' });

  // For Tasks
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedUserId: '', priority: 'MEDIUM', dueDate: '' });

  // For Vendors
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorForm, setVendorForm] = useState({ vendorId: '', task: '', agreedAmount: '' });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.getEventDashboard(Number(id));
      setData(res.data.data);
      setAssignForm({
        eventHeadId: res.data.data.event?.eventHeadId || '',
        assignedTeamId: res.data.data.event?.assignedTeamId || ''
      });
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
      await eventsApi.updateEvent(Number(id), {
        ...data.event,
        eventHeadId: assignForm.eventHeadId ? Number(assignForm.eventHeadId) : null,
        assignedTeamId: assignForm.assignedTeamId ? Number(assignForm.assignedTeamId) : null
      });
      setShowAssignModal(false);
      fetchDashboard();
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Event Control Center...</div>;
  if (!data || !data.event) return <div style={{ padding: '40px', textAlign: 'center' }}>Event not found.</div>;

  const { event, tasks, vendorAssignments, progress } = data;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events/active')} style={{ marginBottom: '10px' }}>← Back to Events</button>
          <h1 className="page-title">{event.name}</h1>
          <p className="page-subtitle">
            {event.startDate} to {event.endDate} | Venue: {event.venue || 'TBD'} | Pax: {event.pax || 'TBD'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>Assign Team / Head</button>
          <span className={`badge ${event.status === 'COMPLETED' ? 'badge-success' : 'badge-primary'}`} style={{ padding: '8px 16px', fontSize: '1rem' }}>
            {event.status}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600 }}>Overall Progress</span>
          <span style={{ fontWeight: 600 }}>{progress}%</span>
        </div>
        <div style={{ width: '100%', height: '12px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Team Assignments */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '15px' }}>👥 Assigned Team</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--background)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Event Head ID</span>
              <span style={{ fontWeight: 600 }}>{event.eventHeadId || 'Unassigned'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--background)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Team ID</span>
              <span style={{ fontWeight: 600 }}>{event.assignedTeamId || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Vendors */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div className="card-title" style={{ margin: 0 }}>🎪 Assigned Vendors</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowVendorModal(true)}>+ Assign Vendor</button>
          </div>
          {vendorAssignments && vendorAssignments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {vendorAssignments.map((va: any) => (
                <div key={va.id} style={{ padding: '10px', background: 'var(--background)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontWeight: 600 }}>Vendor ID: {va.vendor?.id || va.vendorId} - {va.task}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Status: {va.status} | Amt: ₹{va.agreedAmount}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📞 Contact: {va.vendor?.phone || 'Not available'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No vendors assigned yet.</div>
          )}
        </div>
      </div>

      {/* Checklist / Tasks */}
      <div className="card" style={{ marginTop: '20px', padding: 0 }}>
        <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">📝 Event Checklist & Tasks</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
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
                <th>Status</th>
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
                    <td>{task.assignedUserId || 'Unassigned'}</td>
                    <td>{task.dueDate || '-'}</td>
                    <td>
                      <span className={`badge ${task.priority === 'HIGH' ? 'badge-danger' : task.priority === 'MEDIUM' ? 'badge-warning' : 'badge-ghost'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td><span className="badge badge-primary">{task.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No tasks on checklist.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header">
              <div className="card-title">Assign Event Leadership</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Event Head (User ID)</label>
                <input type="number" className="form-input" value={assignForm.eventHeadId} onChange={e => setAssignForm({...assignForm, eventHeadId: e.target.value})} placeholder="Enter User ID (e.g. 1)" />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Team (Team ID)</label>
                <input type="number" className="form-input" value={assignForm.assignedTeamId} onChange={e => setAssignForm({...assignForm, assignedTeamId: e.target.value})} placeholder="Enter Team ID (e.g. 1)" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Assignments</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">Create New Task</div>
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
                  <label className="form-label">Assigned User ID</label>
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
                <button type="submit" className="btn btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Vendor Modal */}
      {showVendorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
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

    </div>
  );
}
