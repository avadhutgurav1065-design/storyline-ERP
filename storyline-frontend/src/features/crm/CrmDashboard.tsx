import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Send, Percent, CheckCircle, Activity, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/client';

const barData = [
  { name: '1', rev: 400, exp: 240 }, { name: '3', rev: 300, exp: 139 },
  { name: '5', rev: 200, exp: 980 }, { name: '7', rev: 278, exp: 390 },
  { name: '9', rev: 189, exp: 480 }, { name: '11', rev: 239, exp: 380 },
  { name: '13', rev: 349, exp: 430 }, { name: '15', rev: 400, exp: 240 },
  { name: '17', rev: 300, exp: 139 }, { name: '19', rev: 200, exp: 980 },
  { name: '21', rev: 278, exp: 390 }, { name: '23', rev: 189, exp: 480 },
  { name: '25', rev: 239, exp: 380 }, { name: '27', rev: 349, exp: 430 },
];

const pieData = [
  { name: 'Success', value: 88, color: '#3B82F6' },
  { name: 'Remaining', value: 12, color: '#E2E8F0' },
];

export default function CrmDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    dashboardApi.getStats().then(res => {
      setStats(res.data.data);
    }).catch(err => console.error("Failed to load dashboard stats", err));
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="form-input" style={{ width: 'auto', padding: '8px 16px' }}>
            <option>Last month</option>
            <option>This month</option>
          </select>
          <button className="btn btn-primary" style={{ background: '#FDE047', color: '#854D0E', border: 'none' }} onClick={() => navigate('/crm/leads')}>
            + New Pitch
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '20px' }}>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Briefcase size={16} /> <span>Total Events</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats?.totalEvents || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Users size={16} /> <span>Active Clients</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats?.totalClients || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Send size={16} /> <span>Total Leads</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats?.totalLeads || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <DollarSign size={16} /> <span>Collected Revenue</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>₹{stats?.monthlyRevenue?.toLocaleString() || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Activity size={16} /> <span>Net Profit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: stats?.netProfit < 0 ? 'var(--danger)' : 'var(--success)' }}>
              ₹{stats?.netProfit?.toLocaleString() || 0}
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px' }}>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Revenues and expenses</h3>
            <button className="btn btn-ghost btn-sm">View all →</button>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-hover)', padding: '12px 16px', borderRadius: '12px', flex: 1 }}>
               <div className="badge-pastel blue" style={{ padding: '8px' }}><Briefcase size={16} /></div>
               <div style={{ flex: 1 }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Revenue</div>
                 <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>$7260,00</div>
               </div>
               <span className="badge-pastel green">+5.2% ↑</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-hover)', padding: '12px 16px', borderRadius: '12px', flex: 1 }}>
               <div className="badge-pastel green" style={{ padding: '8px' }}><Activity size={16} /></div>
               <div style={{ flex: 1 }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Expenses</div>
                 <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>$2523,00</div>
               </div>
               <span className="badge-pastel red">-1.7% ↓</span>
            </div>
          </div>

          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                <Bar dataKey="rev" fill="#818CF8" radius={[10, 10, 10, 10]} barSize={8} />
                <Bar dataKey="exp" fill="#86EFAC" radius={[10, 10, 10, 10]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Your Performance</h3>
            <button className="btn btn-ghost btn-sm">View all →</button>
          </div>
          
          <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="70%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>88%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Success</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}></div>
              <span style={{ fontSize: '0.9rem', flex: 1 }}>Send 3 pitches (2/3)</span>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #E2E8F0' }}></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }}></div>
              <span style={{ fontSize: '0.9rem', flex: 1 }}>Complete 2 campaigns (2/2)</span>
              <CheckCircle size={16} color="#10B981" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></div>
              <span style={{ fontSize: '0.9rem', flex: 1 }}>Upload a new brief (1/1)</span>
              <CheckCircle size={16} color="#10B981" />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px' }}>
        
        <div className="card" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Active deals</h3>
            <button className="btn btn-ghost btn-sm">View all →</button>
          </div>
          <div className="table-container">
            <table className="interactive-table" style={{ width: '100%', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ background: 'transparent' }}>Client</th>
                  <th style={{ background: 'transparent' }}>Task</th>
                  <th style={{ background: 'transparent' }}>Due date</th>
                  <th style={{ background: 'transparent' }}>Revenue</th>
                  <th style={{ background: 'transparent' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover-row">
                  <td style={{ display: 'flex', alignItems: 'center', gap: '12px', border: 'none' }}>
                    <div className="avatar">LH</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Lena Harper</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>lena.harper@influxmedia.co</div>
                    </div>
                  </td>
                  <td style={{ border: 'none' }}>Summer Collab with Glossi...</td>
                  <td style={{ border: 'none' }}>May 21</td>
                  <td style={{ fontWeight: 600, border: 'none' }}>$125</td>
                  <td style={{ border: 'none' }}><span className="badge-pastel blue">In progress</span></td>
                </tr>
                <tr className="hover-row">
                  <td style={{ display: 'flex', alignItems: 'center', gap: '12px', border: 'none' }}>
                    <div className="avatar" style={{ background: '#FEF08A', color: '#854D0E' }}>SK</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Sophie Kim</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>sophie.kim@creatorhive.com</div>
                    </div>
                  </td>
                  <td style={{ border: 'none' }}>Back-to-School with Notio...</td>
                  <td style={{ border: 'none' }}>May 11</td>
                  <td style={{ fontWeight: 600, border: 'none' }}>$320</td>
                  <td style={{ border: 'none' }}><span className="badge-pastel orange">Pending</span></td>
                </tr>
                <tr className="hover-row">
                  <td style={{ display: 'flex', alignItems: 'center', gap: '12px', border: 'none' }}>
                    <div className="avatar" style={{ background: '#BBF7D0', color: '#166534' }}>NB</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Noah Bennett</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>noah.b@bennettstudio.com</div>
                    </div>
                  </td>
                  <td style={{ border: 'none' }}>YouTube Integration for Sq...</td>
                  <td style={{ border: 'none' }}>May 19</td>
                  <td style={{ fontWeight: 600, border: 'none' }}>$450</td>
                  <td style={{ border: 'none' }}><span className="badge-pastel green">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Pending tasks</h3>
            <button className="btn btn-ghost btn-sm">View all →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>N</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Invoice for Notion collab</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>May 4, 2025</div>
              </div>
              <span className="badge-pastel red">High</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#111827', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>t</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>TikTok reels for Nical...</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>May 7, 2025</div>
              </div>
              <span className="badge-pastel orange">Medium</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#FCE7F3', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>I</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Follow up with Gymshark</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>May 13, 2025</div>
              </div>
              <span className="badge-pastel green">Low</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
