import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api, { eventsApi, financeApi, usersApi, vendorsApi, inventoryApi, tasksApi, vendorAssignmentsApi, teamAssignmentsApi } from '../../api/client';

export default function EventDetailsDashboard() {
  const { hasRole } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerNotification } = useNotification();
  const [data, setData] = useState<any>(null);
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ budget: '' });

  const [showHamperModal, setShowHamperModal] = useState(false);
  const [hamperForm, setHamperForm] = useState({ productId: '', quantity: '1', reference: '' });
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam.toUpperCase());
    }
  }, [location.search]);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', role: '', department: '', assignmentLevel: 'TEAM_MEMBER' });
  const [users, setUsers] = useState<any[]>([]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedUserId: '', priority: 'MEDIUM', dueDate: '', dueTime: '', notes: '' });

  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorForm, setVendorForm] = useState({ vendorId: '', task: '', agreedAmount: '' });
  const [vendors, setVendors] = useState<any[]>([]);

  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({ name: '', documentType: 'GUEST_LIST', fileUrl: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [res, financeRes] = await Promise.all([
        eventsApi.getEventDashboard(Number(id)),
        financeApi.getEventProfitAndLoss(Number(id))
      ]);
      setData(res.data.data);
      setFinanceData(financeRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => Number(u.id) === Number(userId));
    if (!user) return `User ID: ${userId}`;
    const nameStr = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return nameStr ? nameStr : user.username || `User ID: ${userId}`;
  };

  useEffect(() => {
    fetchDashboard();
    
    // Fetch users for the assignment modal
    const fetchUsersAndVendors = async () => {
      try {
        const [usersRes, vendorsRes, productsRes] = await Promise.all([
          usersApi.list(),
          vendorsApi.list(),
          inventoryApi ? inventoryApi.listProducts() : Promise.resolve({ data: { data: [] } })
        ]);
        const usersData = usersRes.data.data as any;
        const vendorsData = vendorsRes.data.data as any;
        setUsers(usersData.content || usersData || []);
        setVendors(vendorsData.content || vendorsData || []);
        setProducts(productsRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsersAndVendors();
  }, [id]);

  const handleAssignSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!assignForm.userId) {
      triggerNotification('Warning', 'Please select a team member from the dropdown list.', 'warning');
      return;
    }
    try {
      const res = await api.post(`/events/${id}/team`, {
        userId: Number(assignForm.userId),
        role: assignForm.role,
        department: assignForm.assignmentLevel === 'EVENT_HEAD' ? 'GENERAL' : assignForm.department,
        isHead: assignForm.assignmentLevel === 'EVENT_HEAD' || assignForm.assignmentLevel === 'DEPARTMENT_HEAD'
      });
      if (res.data.success || res.status === 200 || res.status === 201) {
        setShowAssignModal(false);
        setAssignForm({ userId: '', role: '', department: '', assignmentLevel: 'TEAM_MEMBER' });
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHamperSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.issueHamper(Number(hamperForm.productId), { 
        eventId: Number(id), 
        quantity: Number(hamperForm.quantity),
        reference: hamperForm.reference
      });
      setShowHamperModal(false);
      setHamperForm({ productId: '', quantity: '1', reference: '' });
      triggerNotification('Success', 'Hamper issued to event successfully.', 'success');
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to issue hamper.', 'error');
    }
  };

  const handleTaskSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await tasksApi.create({
        event: { id: Number(id) },
        ...taskForm,
        dueTime: taskForm.dueTime ? (taskForm.dueTime.length === 5 ? taskForm.dueTime + ':00' : taskForm.dueTime) : null,
        assignedUserId: taskForm.assignedUserId ? Number(taskForm.assignedUserId) : null,
      });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedUserId: '', priority: 'MEDIUM', dueDate: '', dueTime: '', notes: '' });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVendorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!vendorForm.vendorId) {
      triggerNotification('Warning', 'Please select a vendor from the dropdown list.', 'warning');
      return;
    }
    try {
      const res = await api.post('/vendor-assignments', {
        event: { id: Number(id) },
        vendor: { id: Number(vendorForm.vendorId) },
        task: vendorForm.task,
        agreedAmount: vendorForm.agreedAmount ? parseFloat(vendorForm.agreedAmount) : 0,
        status: 'ASSIGNED'
      });
      if (res.data.success || res.status === 200 || res.status === 201) {
        setShowVendorModal(false);
        setVendorForm({ vendorId: '', task: '', agreedAmount: '' });
        fetchDashboard();
      } else {
        triggerNotification('Error', 'Failed to assign vendor. Server response: ' + JSON.stringify(res.data), 'error');
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification('Error', 'Error assigning vendor: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDocSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      triggerNotification('Error', 'Please select a file to upload', 'error');
      return;
    }
    setUploading(true);
    try {
      // Step 1: Upload the actual file via multipart
      const formData = new FormData();
      formData.append('file', selectedFile);
      const uploadRes = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!uploadRes.data.success) {
        triggerNotification('Error', 'File upload failed: ' + uploadRes.data.message, 'error');
        setUploading(false);
        return;
      }
      const { fileName } = uploadRes.data.data;

      // Step 2: Save the document record with the stored filename
      const res = await api.post(`/events/${id}/documents`, {
        name: docForm.name,
        documentType: docForm.documentType,
        fileUrl: fileName,
      });
      if (res.data.success) {
        setShowDocModal(false);
        setDocForm({ name: '', documentType: 'GUEST_LIST', fileUrl: '' });
        setSelectedFile(null);
        fetchDashboard();
        triggerNotification('Success', 'Document uploaded successfully', 'success');
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification('Error', 'Failed to upload document: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDocForm({ ...docForm, fileUrl: file.name });
    }
  };

  const handleBudgetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await eventsApi.updateEvent(Number(id), {
        ...data.event,
        budget: parseFloat(budgetForm.budget) || 0
      });
      setShowBudgetModal(false);
      fetchDashboard();
      triggerNotification('Success', 'Budget updated successfully', 'success');
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to update budget', 'error');
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      fetchDashboard();
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to update task status', 'error');
    }
  };

  const updateTaskNotes = async (taskId: number, notes: string) => {
    try {
      await tasksApi.update(taskId, { notes });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmVendorAssignment = async (va: any) => {
    try {
      await vendorAssignmentsApi.update(va.id, { ...va, event: {id: Number(id)}, vendor: {id: va.vendorId}, status: 'CONFIRMED' });
      
      await financeApi.createExpense({
        category: 'VENDOR',
        description: `Vendor PO for ${va.task} - Event: ${data?.event?.name}`,
        amount: va.agreedAmount,
        expenseDate: new Date().toISOString().split('T')[0],
        eventId: Number(id),
        vendorId: va.vendorId,
        paymentMethod: 'BANK_TRANSFER',
        status: 'PO_GENERATED'
      });
      fetchDashboard();
      triggerNotification('Success', 'Vendor confirmed and PO generated', 'success');
    } catch (err) {
      console.error(err);
      triggerNotification('Error', 'Failed to confirm vendor assignment and generate PO', 'error');
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate(`/finance/expenses?eventId=${event.id}`)}>
            💸 Log Expense
          </button>
          <span className={`badge ${event.status === 'COMPLETED' ? 'badge-success' : 'badge-primary'}`} style={{ padding: '8px 16px', fontSize: '1rem' }}>
            {event.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid var(--border)', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        {['OVERVIEW', 'TEAM', 'CHECKLIST', 'VENDORS', 'DOCUMENTS', ...(hasRole('ADMIN') || hasRole('FINANCE_MANAGER') || hasRole('EVENT_MANAGER') ? ['FINANCE'] : [])].map(tab => (
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* Event Heads (isHead true, department empty/General) */}
              <div>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '5px' }}>👑 Event Heads</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                  {teamAssignments.filter((ta: any) => ta.isHead && (!ta.department || ta.department === 'General' || ta.department === 'GENERAL')).map((ta: any) => (
                    <div key={ta.id} className="card" style={{ padding: '15px', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{getUserName(ta.userId)}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role: {ta.role}</div>
                        </div>
                        <span className="badge badge-primary">Event Head</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a href={`tel:`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>📞 Call</a>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={async () => {
                          await api.delete(`/events/team/${ta.id}`);
                          fetchDashboard();
                        }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Heads (isHead true, department assigned) */}
              <div>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '5px' }}>👔 Department Heads</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                  {teamAssignments.filter((ta: any) => ta.isHead && ta.department && ta.department !== 'General' && ta.department !== 'GENERAL').map((ta: any) => (
                    <div key={ta.id} className="card" style={{ padding: '15px', borderLeft: '4px solid var(--secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{getUserName(ta.userId)}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dept: {ta.department} | Role: {ta.role}</div>
                        </div>
                        <span className="badge badge-secondary">Dept Head</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a href={`tel:`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>📞 Call</a>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={async () => {
                          await api.delete(`/events/team/${ta.id}`);
                          fetchDashboard();
                        }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Members (isHead false) */}
              <div>
                <h4 style={{ marginBottom: '10px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '5px' }}>👥 Team Members</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                  {teamAssignments.filter((ta: any) => !ta.isHead).map((ta: any) => (
                    <div key={ta.id} className="card" style={{ padding: '15px', borderLeft: '4px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{getUserName(ta.userId)}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dept: {ta.department || 'General'} | Role: {ta.role}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a href={`tel:`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>📞 Call</a>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={async () => {
                          await api.delete(`/events/team/${ta.id}`);
                          fetchDashboard();
                        }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                  <th style={{ width: '130px' }}>Status</th>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Notes / Problem</th>
                </tr>
              </thead>
              <tbody>
                {tasks && tasks.length > 0 ? (
                  tasks.map((task: any) => (
                    <tr key={task.id} style={{ opacity: task.status === 'COMPLETED' ? 0.6 : 1 }}>
                      <td>
                        <select
                          className="form-select"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            height: 'auto',
                            backgroundColor: task.status === 'COMPLETED' ? 'var(--success)' : task.status === 'ISSUE' ? 'var(--danger)' : 'var(--bg-primary)',
                            color: (task.status === 'COMPLETED' || task.status === 'ISSUE') ? 'white' : 'inherit',
                            border: 'none',
                            fontWeight: 'bold'
                          }}
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        >
                          <option value="PENDING" style={{ color: 'black', background: 'white' }}>Pending</option>
                          <option value="IN_PROGRESS" style={{ color: 'black', background: 'white' }}>In Progress</option>
                          <option value="COMPLETED" style={{ color: 'black', background: 'white' }}>Completed</option>
                          <option value="ISSUE" style={{ color: 'black', background: 'white' }}>Issue/Problem</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>{task.title}</div>
                        {task.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.description}</div>}
                      </td>
                      <td>
                        {task.assignedUserId ? 
                          (() => {
                            const assignee = users.find(u => Number(u.id) === Number(task.assignedUserId));
                            return assignee ? `${assignee.firstName} ${assignee.lastName}` : `User ID: ${task.assignedUserId}`;
                          })()
                        : 'Unassigned'}
                      </td>
                      <td>
                        {task.dueDate || '-'}
                        {task.dueTime && <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{task.dueTime}</div>}
                      </td>
                      <td>
                        <span className={`badge ${task.priority === 'HIGH' ? 'badge-danger' : task.priority === 'MEDIUM' ? 'badge-warning' : 'badge-ghost'}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ padding: '4px 8px', fontSize: '0.85rem' }} 
                          placeholder="Add note..." 
                          defaultValue={task.notes || ''}
                          onBlur={(e) => updateTaskNotes(task.id, e.target.value)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No tasks on checklist.</td></tr>
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
              {vendorAssignments.map((va: any) => {
                const vendorInfo = vendors.find(v => Number(v.id) === Number(va.vendorId)) || va.vendor;
                return (
                  <div key={va.id} style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '5px' }}>{vendorInfo?.name || `Vendor ID: ${va.vendorId}`}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>📞 {vendorInfo?.phone || 'No Phone'}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 500 }}>Task: {va.task}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Agreed Amt: ₹{va.agreedAmount}</span>
                      <span className={`badge ${va.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>{va.status || 'PENDING'}</span>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <a href={`tel:${vendorInfo?.phone}`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center', padding: '6px' }}>📞 Call</a>
                      <a href={`https://wa.me/${vendorInfo?.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center', padding: '6px' }}>💬 WhatsApp</a>
                      {(!va.status || va.status === 'PENDING' || va.status === 'ASSIGNED') && (
                        <button className="btn btn-success btn-sm" style={{ flex: 1.5 }} onClick={() => confirmVendorAssignment(va)}>
                          ✓ Confirm & Generate PO
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => {
                      // Build the proper backend URL for viewing inline
                      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://storyline-erp-backend.onrender.com/api');
                      const viewUrl = `${baseUrl}/files/view/${doc.fileUrl}`;
                      window.open(viewUrl, '_blank');
                    }}>View</button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={async () => {
                      try {
                        // Download the file as a blob using authenticated API
                        const response = await api.get(`/files/download/${doc.fileUrl}`, { responseType: 'blob' });
                        const blob = new Blob([response.data]);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = doc.name || 'download';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (err) {
                        console.error('Download failed:', err);
                      }
                    }}>Download</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={async () => {
                      await api.delete(`/events/documents/${doc.id}`);
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

      {activeTab === 'FINANCE' && financeData && (
        <div className="animate-fade-in">
          <div className="card" style={{ marginBottom: '20px', padding: '20px', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📊 Event Profit & Loss</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {event.quotationId && (
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/sales?quoteId=${event.quotationId}`)}>
                    📄 View Quotation
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/finance?eventId=${event.id}`)}>
                  🧾 View Invoices
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowHamperModal(true)}>
                  🎁 Issue Hamper
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  setBudgetForm({ budget: event.budget?.toString() || '0' });
                  setShowBudgetModal(true);
                }}>
                  ✏️ Set Budget
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              
              <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--secondary)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Event Budget</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{event.budget?.toLocaleString() || 0}</div>
                {event.budget > 0 && (
                  <div style={{ fontSize: '0.85rem', color: financeData.directEventCosts > event.budget ? 'var(--danger)' : 'var(--success)', marginTop: '4px' }}>
                    Variance: ₹{(event.budget - financeData.directEventCosts).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Invoiced / Collected</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{financeData.totalRevenue?.toLocaleString()}</div>
                {financeData.outstandingReceivables > 0 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--danger)', marginTop: '4px' }}>
                    Outstanding: ₹{financeData.outstandingReceivables?.toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--warning)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Direct Event Costs (Actual)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{financeData.directEventCosts?.toLocaleString()}</div>
              </div>
              
              <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--success)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Event Gross Margin</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: financeData.grossProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  ₹{financeData.grossProfit?.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '4px' }}>
                  {financeData.totalRevenue > 0 ? ((financeData.grossProfit / financeData.totalRevenue) * 100).toFixed(1) : 0}% Margin
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => navigate('/finance/invoices')}>Manage Invoices</button>
              <button className="btn btn-primary" onClick={() => navigate('/finance/expenses')}>Log Event Expense</button>
            </div>
          </div>
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
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Select Team Member *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search user by name..." 
                  value={userSearch} 
                  onChange={e => {
                    setUserSearch(e.target.value);
                    setShowUserDropdown(true);
                    if (assignForm.userId) setAssignForm({...assignForm, userId: ''});
                  }} 
                  onFocus={() => setShowUserDropdown(true)}
                  onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                  style={{ marginBottom: '8px' }} 
                />
                {showUserDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {users.filter(u => `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase().includes(userSearch.toLowerCase())).length === 0 ? (
                       <div style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>No users found</div>
                    ) : (
                      users.filter(u => `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                        <div 
                          key={u.id}
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                          onMouseDown={() => {
                            setAssignForm({...assignForm, userId: String(u.id)});
                            setUserSearch(getUserName(u.id));
                            setShowUserDropdown(false);
                          }}
                        >
                          {getUserName(u.id)}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Assignment Level *</label>
                <select className="form-select" required value={assignForm.assignmentLevel} onChange={e => setAssignForm({...assignForm, assignmentLevel: e.target.value})}>
                  <option value="EVENT_HEAD">Event Head</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="TEAM_MEMBER">Team Member</option>
                </select>
              </div>
              
              {assignForm.assignmentLevel !== 'EVENT_HEAD' && (
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-select" required value={assignForm.department} onChange={e => setAssignForm({...assignForm, department: e.target.value})}>
                    <option value="">Select Dept...</option>
                    <option value="GENERAL">General / Overall</option>
                    <option value="HOSPITALITY">Hospitality</option>
                    <option value="DECOR">Decor</option>
                    <option value="LOGISTICS">Logistics</option>
                    <option value="PRODUCTION">Production</option>
                    <option value="SOUND_LIGHT">Sound & Light</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Role Title *</label>
                <input 
                  className="form-input" 
                  required 
                  list="roleOptions"
                  value={assignForm.role} 
                  onChange={e => setAssignForm({...assignForm, role: e.target.value})} 
                  placeholder="Select or type role..." 
                />
                <datalist id="roleOptions">
                  <option value="Event Head" />
                  <option value="Technical Head" />
                  <option value="Logistics Head" />
                  <option value="Hospitality Head" />
                  <option value="Decor Head" />
                  <option value="Production Head" />
                  <option value="Team Manager" />
                  <option value="Team Member" />
                  <option value="Freelancer" />
                </datalist>
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
                  <label className="form-label">Assign To (Team Member)</label>
                  <select className="form-select" value={taskForm.assignedUserId} onChange={e => setTaskForm({...taskForm, assignedUserId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {teamAssignments?.map((ta: any) => {
                      const user = users.find(u => Number(u.id) === Number(ta.userId));
                      return (
                        <option key={ta.userId} value={ta.userId}>
                          {user ? `${user.firstName} ${user.lastName}` : `User ID ${ta.userId}`} - {ta.role}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-input" value={taskForm.dueTime} onChange={e => setTaskForm({...taskForm, dueTime: e.target.value})} />
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
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Select Vendor *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search vendor by name..." 
                  value={vendorSearch} 
                  onChange={e => {
                    setVendorSearch(e.target.value);
                    setShowVendorDropdown(true);
                    if (vendorForm.vendorId) setVendorForm({...vendorForm, vendorId: ''});
                  }} 
                  onFocus={() => setShowVendorDropdown(true)}
                  onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                  style={{ marginBottom: '8px' }} 
                />
                {showVendorDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {vendors.filter(v => `${v.name} ${v.serviceType}`.toLowerCase().includes(vendorSearch.toLowerCase())).length === 0 ? (
                       <div style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>No vendors found</div>
                    ) : (
                      vendors.filter(v => `${v.name} ${v.serviceType}`.toLowerCase().includes(vendorSearch.toLowerCase())).map(v => (
                        <div 
                          key={v.id}
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                          onMouseDown={() => {
                            setVendorForm({...vendorForm, vendorId: String(v.id)});
                            setVendorSearch(`${v.name} (${v.phone || 'No Phone'}) - ${v.serviceType || 'General'}`);
                            setShowVendorDropdown(false);
                          }}
                        >
                          {v.name} ({v.phone || 'No Phone'}) - {v.serviceType || 'General'}
                        </div>
                      ))
                    )}
                  </div>
                )}
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
                <input className="form-input" required value={docForm.documentType} onChange={e => setDocForm({...docForm, documentType: e.target.value})} placeholder="e.g., Guest List, Decor Plan" />
              </div>
              <div className="form-group">
                <label className="form-label">Select File *</label>
                <input type="file" className="form-input" required onChange={handleFileUpload} accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.rar,.txt,.csv" />
                {selectedFile && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowDocModal(false); setSelectedFile(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!selectedFile || uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHamperModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header">
              <div className="card-title">Issue Hamper to Event</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowHamperModal(false)}>✕</button>
            </div>
            <form onSubmit={handleHamperSubmit}>
              <div className="form-group">
                <label className="form-label">Select Hamper *</label>
                <select 
                  className="form-input" 
                  required 
                  value={hamperForm.productId} 
                  onChange={e => setHamperForm({...hamperForm, productId: e.target.value})}
                >
                  <option value="">-- Choose a Hamper --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} style={{ color: 'black', background: 'white' }}>
                      {p.name} (Stock: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  min="1"
                  value={hamperForm.quantity} 
                  onChange={e => setHamperForm({...hamperForm, quantity: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reference Note</label>
                <input 
                  className="form-input" 
                  value={hamperForm.reference} 
                  onChange={e => setHamperForm({...hamperForm, reference: e.target.value})} 
                  placeholder="e.g., Client Welcome Kit" 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowHamperModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Issue & Charge Cost</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

