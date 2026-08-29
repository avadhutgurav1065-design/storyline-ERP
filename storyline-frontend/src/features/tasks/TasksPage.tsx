import { useState, useEffect } from 'react';
import { tasksApi, usersApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

export default function TasksPage({ filter }: { filter: 'my' | 'team' | 'all' }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const { triggerNotification } = useNotification();

  // Modal state
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [notesUpdate, setNotesUpdate] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        tasksApi.list(),
        usersApi.list()
      ]);
      
      const allTasks = tasksRes.data.data || [];
      const usersList = usersRes.data.data.content || [];
      
      const uMap: Record<number, any> = {};
      usersList.forEach((u: any) => { uMap[u.id] = u; });
      
      setUsersMap(uMap);
      setTasks(allTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      fetchData();
      
      if (newStatus === 'BLOCKED') {
        triggerNotification('Task Blocked', 'A task has been flagged as blocked.', 'error');
      } else if (newStatus === 'COMPLETED') {
        triggerNotification('Task Completed', 'A task was marked as completed!', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openTaskModal = (task: any) => {
    setSelectedTask(task);
    setNotesUpdate(task.notes || '');
    setStatusUpdate(task.status);
  };

  const submitTaskUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksApi.update(selectedTask.id, { 
        status: statusUpdate,
        notes: notesUpdate
      });
      
      if (statusUpdate === 'BLOCKED') {
        triggerNotification('Emergency Update', `Task "${selectedTask.title}" flagged as BLOCKED. Problem noted.`, 'error');
      } else {
        triggerNotification('Task Updated', `Task notes and status updated successfully.`, 'success');
      }
      
      setSelectedTask(null);
      fetchData();
    } catch (err) {
      console.error("Error updating task", err);
    }
  };

  const titles = {
    my: 'My Tasks',
    team: 'Team Tasks',
    all: 'All Tasks'
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">{titles[filter]}</h1>
          <p className="page-subtitle">Track your event checklists and assignments</p>
        </div>
        <button className="btn btn-outline" onClick={fetchData}>
          <span style={{ marginRight: '8px' }}>↻</span> Refresh
        </button>
      </div>

      <div className="card" style={{ padding: 0, border: 'none', background: 'transparent' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="interactive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Task Title</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Assignee</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Event</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Priority</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading tasks...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No tasks found</td></tr>
              ) : (
                tasks.map((task) => {
                  const assignee = usersMap[task.assigneeId];
                  const avatarColor = assignee ? ['#E0F2FE', '#FEF08A', '#BBF7D0', '#FCE7F3'][assignee.id % 4] : '#F3F4F6';
                  const textColor = assignee ? ['#0284C7', '#854D0E', '#166534', '#DB2777'][assignee.id % 4] : '#9CA3AF';

                  return (
                  <tr key={task.id} className="hover-row" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px' }} data-label="Task Title">
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{task.description || '—'}</div>
                    </td>
                    <td style={{ padding: '16px' }} data-label="Assignee">
                      {assignee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="avatar" style={{ background: avatarColor, color: textColor }}>
                            {getInitials(assignee.fullName)}
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{assignee.fullName}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }} data-label="Event">{task.event?.name || '—'}</td>
                    <td style={{ padding: '16px' }} data-label="Priority">
                      <span className={`badge-pastel ${
                        task.priority === 'HIGH' ? 'red' : 
                        task.priority === 'MEDIUM' ? 'orange' : 'blue'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }} data-label="Status">
                      <select 
                        className={`badge-pastel ${
                          task.status === 'COMPLETED' ? 'green' : 
                          task.status === 'BLOCKED' ? 'red' :
                          task.status === 'IN_PROGRESS' ? 'orange' : 'gray'
                        }`}
                        style={{ padding: '4px 12px', fontSize: '0.75rem', border: 'none', cursor: 'pointer', appearance: 'none' }}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="BLOCKED">BLOCKED</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }} data-label="Actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openTaskModal(task)}>
                        Details
                      </button>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Details & Update Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-card)', maxWidth: '500px', width: '90%', padding: '32px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '1.25rem' }}>{selectedTask.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{selectedTask.description}</p>
            
            <form onSubmit={submitTaskUpdate}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Task Status</label>
                <select 
                  className="form-input"
                  value={statusUpdate}
                  onChange={e => setStatusUpdate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="BLOCKED">Blocked (Report Problem)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Problem Details / Updates
                </label>
                <textarea 
                  className="form-input" 
                  value={notesUpdate}
                  onChange={e => setNotesUpdate(e.target.value)}
                  placeholder="If blocked or facing issues, describe the problem here..."
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedTask(null)} style={{ padding: '8px 16px', borderRadius: '8px' }}>Close</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Save Updates</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
