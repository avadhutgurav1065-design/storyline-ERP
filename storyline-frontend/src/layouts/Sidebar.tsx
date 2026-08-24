import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: '',
    items: [
      { path: '/', label: 'Dashboard', icon: '🏠' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { path: '/leads', label: 'Leads', icon: '📋', roles: ['ADMIN', 'EVENT_MANAGER'] },
      { path: '/clients', label: 'Clients', icon: '👥', roles: ['ADMIN', 'EVENT_MANAGER'] },
      { path: '/followups', label: 'Follow-ups', icon: '📞', roles: ['ADMIN', 'EVENT_MANAGER'] },
    ],
  },
  {
    title: 'Sales',
    items: [
      { path: '/quotations', label: 'Quotations', icon: '💼', roles: ['ADMIN', 'EVENT_MANAGER', 'FINANCE_MANAGER'] },
      { path: '/quotation-history', label: 'Quote History', icon: '📚', roles: ['ADMIN', 'EVENT_MANAGER', 'FINANCE_MANAGER'] },
    ],
  },
  {
    title: 'Events',
    items: [
      { path: '/events', label: 'All Events', icon: '🎪' },
      { path: '/events/active', label: 'Active Events', icon: '🟢' },
      { path: '/events/calendar', label: 'Calendar', icon: '📅' },
    ],
  },
  {
    title: 'Teams',
    items: [
      { path: '/teams', label: 'Teams', icon: '👷', roles: ['ADMIN', 'EVENT_MANAGER'] },
      { path: '/members', label: 'Members', icon: '👤' },
    ],
  },
  {
    title: 'Vendors',
    items: [
      { path: '/vendors', label: 'Vendors', icon: '🤝', roles: ['ADMIN', 'EVENT_MANAGER'] },
      { path: '/vendor-assignments', label: 'Assignments', icon: '📋' },
    ],
  },
  {
    title: 'Tasks',
    items: [
      { path: '/tasks/my', label: 'My Tasks', icon: '✅' },
      { path: '/tasks/team', label: 'Team Tasks', icon: '📝' },
      { path: '/tasks/all', label: 'All Tasks', icon: '📊', roles: ['ADMIN', 'EVENT_MANAGER'] },
    ],
  },
  {
    title: 'Hampers',
    items: [
      { path: '/hampers', label: 'Products', icon: '🎁', roles: ['ADMIN', 'INVENTORY_MANAGER'] },
      { path: '/bom', label: 'BOM', icon: '📐', roles: ['ADMIN', 'INVENTORY_MANAGER'] },
      { path: '/manufacturing', label: 'Manufacturing', icon: '🏭', roles: ['ADMIN', 'INVENTORY_MANAGER'] },
      { path: '/raw-materials', label: 'Raw Materials', icon: '📦', roles: ['ADMIN', 'INVENTORY_MANAGER'] },
      { path: '/dispatch', label: 'Dispatch', icon: '🚚', roles: ['ADMIN', 'INVENTORY_MANAGER'] },
    ],
  },
  {
    title: 'Finance',
    items: [
      { path: '/finance/invoices', label: 'Invoices', icon: '🧾', roles: ['ADMIN', 'FINANCE_MANAGER'] },
      { path: '/finance/client-payments', label: 'Client Payments', icon: '💳', roles: ['ADMIN', 'FINANCE_MANAGER'] },
      { path: '/finance/vendor-payments', label: 'Vendor Payments', icon: '💸', roles: ['ADMIN', 'FINANCE_MANAGER'] },
      { path: '/finance/expenses', label: 'Expenses', icon: '🧮', roles: ['ADMIN', 'FINANCE_MANAGER'] },
      { path: '/finance/profit-loss', label: 'Profit & Loss', icon: '📊', roles: ['ADMIN', 'FINANCE_MANAGER'] },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/reports', label: 'Reports', icon: '📊', roles: ['ADMIN', 'EVENT_MANAGER', 'FINANCE_MANAGER'] },
      { path: '/notifications', label: 'Notifications', icon: '🔔' },
      { path: '/users', label: 'Users', icon: '⚙️', roles: ['ADMIN'] },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { hasRole } = useAuth();
  const location = useLocation();

  const isVisible = (item: NavItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((role) => hasRole(role));
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">S</div>
        <span className="logo-text">Storyline ERP</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navigation.map((group, gIdx) => {
          const visibleItems = group.items.filter(isVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div className="nav-group" key={gIdx}>
              {group.title && (
                <div className="nav-group-title">{group.title}</div>
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile} // Close menu when an item is clicked on mobile
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
