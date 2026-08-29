import { useState, useEffect } from 'react';
import { usersApi, tasksApi } from '../../api/client';

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Task Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, tasksRes] = await Promise.all([
        usersApi.list(),
        tasksApi.list()
      ]);
      setMembers(membersRes.data.data.content || []);
      setTasks(tasksRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTaskClick = (member: any) => {
    setSelectedMember(member);
    setShowAssignModal(true);
  };

  const submitAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksApi.create({
        title: taskTitle,
        description: taskDescription || `Task assigned directly from Members page.`,
        status: 'PENDING',
        priority: taskPriority,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        assigneeId: selectedMember.id,
      });
      // Refresh tasks
      const tasksRes = await tasksApi.list();
      setTasks(tasksRes.data.data || []);
      setShowAssignModal(false);
      
      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('MEDIUM');
      setTaskDueDate('');
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  // Helper to determine if a member is "In-House" or "Freelancer"
  const getEmploymentType = (role: string) => {
    const lowercaseRole = (role || '').toLowerCase();
    if (lowercaseRole.includes('vendor') || lowercaseRole.includes('freelance') || lowercaseRole.includes('contract')) {
      return 'Freelancer';
    }
    return 'In-House';
  };

  const getMemberInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Predefined vibrant gradients for avatars
  const avatarGradients = [
    'linear-gradient(135deg, #6366f1, #a855f7)',
    'linear-gradient(135deg, #3b82f6, #2dd4bf)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #10b981, #3b82f6)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)'
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">Directory of in-house staff and event freelancers</p>
        </div>
        <button className="btn btn-primary" onClick={() => fetchData()}>
          <span style={{ marginRight: '8px' }}>↻</span> Refresh Data
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading members...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
          marginTop: '20px'
        }}>
          {members.map((m) => {
            // Calculate active tasks
            const memberTasks = tasks.filter(t => t.assigneeId === m.id && t.status !== 'COMPLETED');
            const empType = getEmploymentType(m.roleName);
            const avatarBg = avatarGradients[(m.id || 0) % avatarGradients.length];

            return (
              <div key={m.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Header section */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: avatarBg,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {getMemberInitials(m.fullName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.fullName}
                      </h3>
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
                      }} title="Online"></span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '6px' }}>{m.email}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="badge badge-primary">{m.roleName || 'Staff'}</span>
                      <span className={`badge ${empType === 'In-House' ? 'badge-success' : 'badge-warning'}`}>{empType}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div style={{ 
                  backgroundColor: 'var(--bg-main)', 
                  borderRadius: '8px', 
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Active Tasks</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{memberTasks.length}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Status</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: memberTasks.length > 5 ? '#ef4444' : '#10b981' }}>
                      {memberTasks.length > 5 ? 'Overloaded' : 'Available'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <a href={`mailto:${m.email}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center', padding: '8px' }}>
                    Email
                  </a>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px' }} onClick={() => handleAssignTaskClick(m)}>
                    Assign Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Assign Task Modal */}
      {showAssignModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-card)', maxWidth: '500px', width: '90%', padding: '32px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>Assign Task to {selectedMember.fullName}</h2>
            <form onSubmit={submitAssignTask}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Task Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g., Review venue contracts"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Description</label>
                <textarea 
                  className="form-input" 
                  value={taskDescription}
                  onChange={e => setTaskDescription(e.target.value)}
                  placeholder="Details about the task..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Priority</label>
                  <select 
                    className="form-input"
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.95rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Due Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAssignModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
