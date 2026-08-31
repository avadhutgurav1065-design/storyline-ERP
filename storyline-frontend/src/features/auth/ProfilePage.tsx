import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import '../../index.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { triggerNotification } = useNotification();
  
  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  
  // HR Details State
  const [address, setAddress] = useState(user?.address || '');
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergencyContactPhone || '');
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // User preferences
  const [themePreference, setThemePreference] = useState(user?.themePreference || 'system');
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(user?.pushNotifications ?? true);

  // Activity logs
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  // Sync local state when user context updates (e.g., after refreshUser or initial load)
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
      setAddress(user.address || '');
      setEmergencyContactName(user.emergencyContactName || '');
      setEmergencyContactPhone(user.emergencyContactPhone || '');
      setEmployeeId(user.employeeId || '');
      setThemePreference(user.themePreference || 'system');
      setEmailNotifications(user.emailNotifications ?? true);
      setPushNotifications(user.pushNotifications ?? true);
    }
  }, [user]);

  const fetchActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const res = await authApi.getRecentActivities();
      setActivities(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch activities");
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await authApi.updateProfile({ 
        fullName, 
        phone, 
        avatarUrl,
        address,
        emergencyContactName,
        emergencyContactPhone,
        employeeId
      });
      await refreshUser();
      triggerNotification('Success', 'Profile updated successfully!', 'success');
      fetchActivities(); // Refresh activities after profile update
    } catch (err: any) {
      console.error('Profile update error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      triggerNotification('Error', errorMessage, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      triggerNotification('Error', 'New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      triggerNotification('Error', 'Password must be at least 8 characters long', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      triggerNotification('Success', 'Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchActivities();
    } catch (err: any) {
      triggerNotification('Error', err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    try {
      await authApi.updateProfile({ [key]: value });
      await refreshUser();
      triggerNotification('Success', 'Preferences updated', 'success');
      
      // If theme changed, we apply it immediately (in a real app, you'd update an app-wide context)
      if (key === 'themePreference') {
        if (value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      }
    } catch (err: any) {
      console.error('Preference update error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update preferences';
      triggerNotification('Error', errorMessage, 'error');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Compress image using canvas
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setAvatarUrl(compressedBase64);
          // Automatically save the avatar change
          authApi.updateProfile({ avatarUrl: compressedBase64 })
            .then(() => refreshUser())
            .then(() => {
               triggerNotification('Success', 'Profile Photo Successfully Updated!', 'success');
               setIsUploadingAvatar(false);
            })
            .catch((err) => {
               console.error('Avatar upload error:', err);
               triggerNotification('Error', err.response?.data?.message || 'Failed to save avatar', 'error');
               setIsUploadingAvatar(false);
            });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const roleObj = user?.roles?.[0];
  const roleStr = typeof roleObj === 'string' ? roleObj : (roleObj as any)?.name || '';
  const userRole = (typeof roleStr === 'string' && roleStr) 
    ? roleStr.replace('ROLE_', '').replace('_', ' ') 
    : 'EMPLOYEE';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: '20px' }}>
        
        {/* Left Column: Profile Card & Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
            <div 
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: avatarUrl ? 'transparent' : 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: 'bold',
                marginTop: '10px',
                backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '4px solid var(--border-color)',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile picture"
            >
              {!avatarUrl && initials}
              
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: 'var(--primary-600)',
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                border: '2px solid var(--bg-card)'
              }}>
                📷
              </div>
              
              {isUploadingAvatar && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  Uploading...
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleAvatarUpload}
            />

            <div>
              <h2 style={{ margin: '0 0 5px 0' }}>{user?.fullName}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>{user?.email}</div>
              <span className={`status-badge status-active`}>{userRole}</span>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="card">
            <h2 className="section-title">Preferences</h2>
            
            <div className="form-group">
              <label>UI Theme</label>
              <select 
                className="form-select" 
                value={themePreference} 
                onChange={(e) => {
                  setThemePreference(e.target.value);
                  handlePreferenceChange('themePreference', e.target.value);
                }}
              >
                <option value="system">System Default</option>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email Notifications</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receive daily summaries and urgent alerts</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailNotifications} 
                  onChange={(e) => {
                    setEmailNotifications(e.target.checked);
                    handlePreferenceChange('emailNotifications', e.target.checked);
                  }} 
                  style={{ width: '20px', height: '20px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Push Notifications</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time alerts for tasks and events</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={pushNotifications} 
                  onChange={(e) => {
                    setPushNotifications(e.target.checked);
                    handlePreferenceChange('pushNotifications', e.target.checked);
                  }}
                  style={{ width: '20px', height: '20px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms & Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Update Profile Form */}
          <div className="card">
            <h2 className="section-title">Personal & HR Details</h2>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled style={{ backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Employee ID</label>
                  <input type="text" className="form-input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP-001" />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea className="form-textarea" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
              </div>

              <h3 style={{ fontSize: '0.95rem', marginTop: '10px', color: 'var(--text-secondary)' }}>Emergency Contact</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label>Contact Name</label>
                  <input type="text" className="form-input" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input type="text" className="form-input" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={isSavingProfile} style={{ alignSelf: 'flex-start' }}>
                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card">
            <h2 className="section-title">Security</h2>
            <form onSubmit={handleChangePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '15px', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Current Password</label>
                <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>New Password</label>
                <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Confirm Password</label>
                <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isChangingPassword} style={{ backgroundColor: '#eab308' }}>
                {isChangingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Activity Log */}
          <div className="card">
            <h2 className="section-title">Recent Activity</h2>
            {isLoadingActivities ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : activities.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activities.map((act) => (
                  <div key={act.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                    <div style={{ 
                      width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-500)', marginTop: '6px', flexShrink: 0
                    }}></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{act.action}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0' }}>{act.details}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(act.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
