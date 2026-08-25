import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

// Map routes to page titles
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Lead Management',
  '/clients': 'Client Management',
  '/followups': 'Follow-ups',
  '/quotations': 'Quotations',
  '/quotation-history': 'Quotation History',
  '/events': 'All Events',
  '/events/active': 'Active Events',
  '/events/calendar': 'Event Calendar',
  '/teams': 'Teams',
  '/members': 'Members',
  '/vendors': 'Vendors',
  '/tasks/my': 'My Tasks',
  '/tasks/team': 'Team Tasks',
  '/tasks/all': 'All Tasks',
  '/hampers/products': 'Hamper Products',
  '/hampers/bom': 'Bill of Materials',
  '/hampers/manufacturing': 'Manufacturing',
  '/hampers/materials': 'Raw Materials',
  '/inventory': 'Inventory',
  '/inventory/dispatch': 'Dispatch',
  '/finance/invoices': 'Invoices',
  '/finance/client-payments': 'Client Payments',
  '/finance/vendor-payments': 'Vendor Payments',
  '/finance/expenses': 'Expenses',
  '/finance/profit-loss': 'Profit & Loss',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/users': 'User Management',
};

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const pageTitle = pageTitles[location.pathname] || 'Storyline ERP';

  return (
    <div className="app-layout">
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className={`app-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileToggle={() => setMobileMenuOpen(true)}
          title={pageTitle}
        />
        <main className="main-content animate-fade-in">
          <Outlet />
        </main>
      </div>
      
      <BottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
    </div>
  );
}
