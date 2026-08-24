import { useState, useEffect } from 'react';
import { usersApi } from '../../api/client';

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await usersApi.list();
        setMembers(res.data.data.content);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">View all staff and team members available for assignment</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px' }}>Loading members...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px' }}>No members found</td></tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', background: 'var(--primary-500)' }}>
                          {m.fullName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div style={{ fontWeight: 600 }}>{m.fullName}</div>
                      </div>
                    </td>
                    <td>{m.email}</td>
                    <td><span className="badge badge-info">{m.roleName}</span></td>
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
