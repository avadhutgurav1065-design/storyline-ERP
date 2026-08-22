import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import UserManagementPage from './features/users/UserManagementPage';
import LeadsPage from './features/crm/LeadsPage';
import ClientsPage from './features/crm/ClientsPage';
import QuotationsPage from './features/sales/QuotationsPage';
import EventsPage from './features/events/EventsPage';
import HampersPage from './features/inventory/HampersPage';
import InvoicesPage from './features/finance/InvoicesPage';
import PlaceholderPage from './components/PlaceholderPage';
import './index.css';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: '1rem', color: 'var(--text-muted)',
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Public Route — redirect to dashboard if already logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />

      {/* Protected Routes — inside App Shell */}
      <Route element={
        <ProtectedRoute><AppLayout /></ProtectedRoute>
      }>
        {/* Dashboard */}
        <Route path="/" element={<DashboardPage />} />

        {/* Users (Phase 1) */}
        <Route path="/users" element={<UserManagementPage />} />

        {/* CRM (Phase 2) */}
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/followups" element={<PlaceholderPage icon="📞" title="Follow-ups" description="Schedule and track follow-ups with leads and clients." phase="Phase 2 — Coming Soon" />} />

        {/* Sales (Phase 2) */}
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/quotation-history" element={<PlaceholderPage icon="📚" title="Quotation History" description="Search and browse all past quotations across clients and events." phase="Phase 2 — Coming Soon" />} />

        {/* Events (Phase 3) */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/active" element={<PlaceholderPage icon="🟢" title="Active Events" description="Monitor currently active events and their progress." phase="Phase 3 — Coming Soon" />} />
        <Route path="/events/calendar" element={<PlaceholderPage icon="📅" title="Event Calendar" description="Calendar view of all upcoming events." phase="Phase 3 — Coming Soon" />} />
        <Route path="/tasks" element={<PlaceholderPage icon="✅" title="Task Management" description="Track event-specific checklists, assign tasks to team members, and monitor deadlines." phase="Phase 3 — Coming Soon" />} />

        {/* Teams Placeholders (Phase 3) */}
        <Route path="/teams" element={<PlaceholderPage icon="👷" title="Team Management" description="Manage departments, team heads, and team members." phase="Phase 3 — Coming Soon" />} />
        <Route path="/members" element={<PlaceholderPage icon="👤" title="Members" description="View and manage team members across all departments." phase="Phase 3 — Coming Soon" />} />

        {/* Vendors Placeholders (Phase 3) */}
        <Route path="/vendors" element={<PlaceholderPage icon="🤝" title="Vendor Management" description="Manage vendors, their services, rates, and performance." phase="Phase 3 — Coming Soon" />} />
        <Route path="/vendor-assignments" element={<PlaceholderPage icon="📋" title="Vendor Assignments" description="Track vendor assignments across events." phase="Phase 3 — Coming Soon" />} />

        {/* Tasks Placeholders (Phase 3) */}
        <Route path="/tasks/my" element={<PlaceholderPage icon="✅" title="My Tasks" description="View and manage your assigned tasks and checklists." phase="Phase 3 — Coming Soon" />} />
        <Route path="/tasks/team" element={<PlaceholderPage icon="📝" title="Team Tasks" description="Monitor your team's task progress." phase="Phase 3 — Coming Soon" />} />
        <Route path="/tasks/all" element={<PlaceholderPage icon="📊" title="All Tasks" description="Overview of all tasks across all events." phase="Phase 3 — Coming Soon" />} />

        {/* Inventory & Hamper Placeholders (Phase 4) */}
        <Route path="/hampers" element={<HampersPage />} />
        <Route path="/inventory" element={<PlaceholderPage icon="📦" title="Raw Material Inventory" description="Track stock levels, set reorder points, and manage warehousing." phase="Phase 4 — Coming Soon" />} />
        <Route path="/hampers/manufacturing" element={<PlaceholderPage icon="🏭" title="Manufacturing" description="Create and manage manufacturing batches with QC." phase="Phase 4 — Coming Soon" />} />
        <Route path="/hampers/materials" element={<PlaceholderPage icon="📦" title="Raw Materials" description="Track raw material inventory and reorder levels." phase="Phase 4 — Coming Soon" />} />

        {/* Inventory Placeholders (Phase 4) */}
        <Route path="/inventory/dispatch" element={<PlaceholderPage icon="🚚" title="Dispatch" description="Track hamper dispatches and deliveries to events." phase="Phase 4 — Coming Soon" />} />

        {/* Finance (Phase 5) */}
        <Route path="/finance/invoices" element={<InvoicesPage />} />
        <Route path="/finance/client-payments" element={<PlaceholderPage icon="💳" title="Client Payments" description="Track advance, partial, and final payments from clients." phase="Phase 5 — Coming Soon" />} />
        <Route path="/finance/vendor-payments" element={<PlaceholderPage icon="💸" title="Vendor Payments" description="Manage vendor payment schedules and settlements." phase="Phase 5 — Coming Soon" />} />
        <Route path="/finance/expenses" element={<PlaceholderPage icon="🧮" title="Expenses" description="Track and approve expenses linked to events and batches." phase="Phase 5 — Coming Soon" />} />
        <Route path="/finance/profit-loss" element={<PlaceholderPage icon="📊" title="Profit & Loss" description="Event-level profitability analysis and P&L statements." phase="Phase 5 — Coming Soon" />} />

        {/* Reports & Notifications */}
        <Route path="/reports" element={<PlaceholderPage icon="📊" title="Reports" description="Comprehensive analytics and management dashboards." phase="Phase 6 — Coming Soon" />} />
        <Route path="/notifications" element={<PlaceholderPage icon="🔔" title="Notifications" description="Stay informed about tasks, payments, and deadlines." phase="Phase 6 — Coming Soon" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
