import { useState, useEffect } from 'react';
import { tasksApi } from '../../api/client';

export default function TasksPage({ filter }: { filter: 'my' | 'team' | 'all' }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await tasksApi.list();
      let allTasks = res.data.data || [];
      // If we had proper backend filtering we would pass it there, but for demo we filter locally 
      // based on context if needed. For now, just show what is returned.
      setTasks(allTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const titles = {
    my: 'My Tasks',
    team: 'Team Tasks',
    all: 'All Tasks'
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{titles[filter]}</h1>
          <p className="page-subtitle">Track your event checklists and assignments</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Event</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading tasks...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No tasks found</td></tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td data-label="Task Title">
                      <div style={{ fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.description || '—'}</div>
                    </td>
                    <td data-label="Event">{task.event?.name || '—'}</td>
                    <td data-label="Due Date">{task.dueDate || '—'}</td>
                    <td data-label="Priority">
                      <span className={`badge ${
                        task.priority === 'HIGH' ? 'badge-danger' : 
                        task.priority === 'MEDIUM' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td data-label="Status">
                      <select 
                        className={`form-input badge ${
                          task.status === 'COMPLETED' ? 'badge-success' : 
                          task.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-secondary'
                        }`}
                        style={{ padding: '4px 24px 4px 8px', fontSize: '0.75rem', height: 'auto' }}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="BLOCKED">BLOCKED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

