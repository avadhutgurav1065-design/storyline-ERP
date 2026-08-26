import { useState, useEffect, type FormEvent } from 'react';
import { usersApi } from '../../api/client';
import type { UserResponse, PageResponse, CreateUserRequest } from '../../types';

const availableRoles = [
  'ADMIN', 'EVENT_MANAGER', 'EVENT_HEAD', 'TEAM_HEAD',
  'TEAM_MEMBER', 'FINANCE_MANAGER', 'INVENTORY_MANAGER', 'VENDOR'
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // New user form
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '', email: '', password: '', fullName: '', phone: '', roles: [],
  });
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.list({ search: search || undefined, page, size: 10 });
      const data: PageResponse<UserResponse> = response.data.data;
      setUsers(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await usersApi.create(formData);
      setShowModal(false);
      setFormData({ username: '', email: '', password: '', fullName: '', phone: '', roles: [] });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await usersApi.toggleStatus(userId);
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'badge-danger',
    EVENT_MANAGER: 'badge-primary',
    EVENT_HEAD: 'badge-info',
    TEAM_HEAD: 'badge-warning',
    TEAM_MEMBER: 'badge-success',
    FINANCE_MANAGER: 'badge-primary',
    INVENTORY_MANAGER: 'badge-warning',
    VENDOR: 'badge-info',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and their roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search users by name, email, or username..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {user.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {user.roles?.map((role) => (
                          <span key={role} className={`badge ${roleColors[role] || 'badge-primary'}`}>
                            {role.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.active ? 'badge-success' : 'badge-danger'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" title="Edit">✏️</button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title={user.active ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.active ? '🚫' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            borderTop: '1px solid var(--border-color)',
          }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              ← Previous
            </button>
            <span style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Page {page + 1} of {totalPages}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="card-header">
              <div className="card-title">Create New User</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {formError && (
              <div style={{
                padding: '10px 14px', marginBottom: '16px',
                background: 'var(--danger-50)', color: 'var(--danger-600)',
                borderRadius: 'var(--border-radius)', fontSize: '0.85rem',
                border: '1px solid var(--danger-100)',
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-input" required value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-input" required minLength={8} value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Roles</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {availableRoles.map((role) => (
                    <label key={role} style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '0.825rem', cursor: 'pointer',
                    }}>
                      <input type="checkbox"
                        checked={formData.roles?.includes(role)}
                        onChange={(e) => {
                          const roles = e.target.checked
                            ? [...(formData.roles || []), role]
                            : (formData.roles || []).filter((r) => r !== role);
                          setFormData({ ...formData, roles });
                        }}
                      />
                      {role.replace('_', ' ')}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

