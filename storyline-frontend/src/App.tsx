import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './features/auth/LoginPage';
import ProfilePage from './features/auth/ProfilePage';
import DashboardPage from './features/dashboard/DashboardPage';
import UserManagementPage from './features/users/UserManagementPage';
import LeadsPage from './features/crm/LeadsPage';
import ClientsPage from './features/crm/ClientsPage';
import FollowupsPage from './features/crm/FollowupsPage';
import CrmDashboard from './features/crm/CrmDashboard';
import QuotationsPage from './features/sales/QuotationsPage';
import QuotationPdfView from './features/sales/QuotationPdfView';
import QuotationHistoryPage from './features/sales/QuotationHistoryPage';
import EventsPage from './features/events/EventsPage';
import HampersPage from './features/inventory/HampersPage';
import RawMaterialsPage from './features/inventory/RawMaterialsPage';
import BomPage from './features/inventory/BomPage';
import ManufacturingPage from './features/inventory/ManufacturingPage';
import DispatchPage from './features/inventory/DispatchPage';
import InvoicesPage from './features/finance/InvoicesPage';
import ClientPaymentsPage from './features/finance/ClientPaymentsPage';
import ExpensesPage from './features/finance/ExpensesPage';
import OverheadsPage from './features/finance/OverheadsPage';
import FinanceDashboard from './features/finance/FinanceDashboard';
import PettyCashPage from './features/finance/PettyCashPage';
import ReportsPage from './features/reports/ReportsPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import ActiveEventsPage from './features/events/ActiveEventsPage';
import EventDetailsDashboard from './features/events/EventDetailsDashboard';
import EventCalendarPage from './features/events/EventCalendarPage';
import VendorsPage from './features/vendors/VendorsPage';
import VendorAssignmentsPage from './features/vendors/VendorAssignmentsPage';
import TeamManagementPage from './features/teams/TeamManagementPage';
import MembersPage from './features/teams/MembersPage';
import TasksPage from './features/tasks/TasksPage';
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

// Role-Based Route
function RoleRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { hasRole, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(role => hasRole(role));
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
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

        {/* Profile */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Users (Phase 1) */}
        <Route path="/users" element={<RoleRoute allowedRoles={['ADMIN']}><UserManagementPage /></RoleRoute>} />

        {/* CRM (Phase 2) */}
        <Route path="/crm" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><CrmDashboard /></RoleRoute>} />
        <Route path="/crm/leads" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><LeadsPage /></RoleRoute>} />
        <Route path="/crm/clients" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><ClientsPage /></RoleRoute>} />
        <Route path="/crm/followups" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><FollowupsPage /></RoleRoute>} />

        {/* Sales (Phase 2) */}
        <Route path="/quotations" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'FINANCE_MANAGER']}><QuotationsPage /></RoleRoute>} />
        <Route path="/quotations/:id/pdf" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'FINANCE_MANAGER']}><QuotationPdfView /></RoleRoute>} />
        <Route path="/quotation-history" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'FINANCE_MANAGER']}><QuotationHistoryPage /></RoleRoute>} />

        {/* Events (Phase 3) */}
        <Route path="/events" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'TEAM_MANAGER']}><EventsPage /></RoleRoute>} />
        <Route path="/events/active" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'TEAM_MANAGER']}><ActiveEventsPage /></RoleRoute>} />
        <Route path="/events/my-assignments" element={<RoleRoute allowedRoles={['TEAM_MANAGER', 'FREELANCER']}><ActiveEventsPage /></RoleRoute>} />
        <Route path="/events/:id" element={<EventDetailsDashboard />} />
        <Route path="/events/calendar" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'TEAM_MANAGER']}><EventCalendarPage /></RoleRoute>} />
        <Route path="/tasks" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><TasksPage filter="all" /></RoleRoute>} />

        {/* Teams Placeholders (Phase 3) */}
        <Route path="/teams" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'TEAM_MANAGER']}><TeamManagementPage /></RoleRoute>} />
        <Route path="/members" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'TEAM_MANAGER']}><MembersPage /></RoleRoute>} />

        {/* Vendors Placeholders (Phase 3) */}
        <Route path="/vendors" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'TEAM_MANAGER', 'FINANCE_MANAGER']}><VendorsPage /></RoleRoute>} />
        <Route path="/vendor-assignments" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'TEAM_MANAGER', 'FINANCE_MANAGER', 'FREELANCER']}><VendorAssignmentsPage /></RoleRoute>} />

        {/* Tasks Placeholders (Phase 3) */}
        <Route path="/tasks/my" element={<TasksPage filter="my" />} />
        <Route path="/tasks/team" element={<TasksPage filter="team" />} />
        <Route path="/tasks/all" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><TasksPage filter="all" /></RoleRoute>} />

        {/* Inventory & Hamper (Phase 5) */}
        <Route path="/hampers" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><HampersPage /></RoleRoute>} />
        <Route path="/raw-materials" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><RawMaterialsPage /></RoleRoute>} />
        <Route path="/bom" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><BomPage /></RoleRoute>} />
        <Route path="/manufacturing" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><ManufacturingPage /></RoleRoute>} />
        <Route path="/dispatch" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER']}><DispatchPage /></RoleRoute>} />

        {/* Finance (Phase 5) */}
        <Route path="/finance/invoices" element={<RoleRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER']}><InvoicesPage /></RoleRoute>} />
        <Route path="/finance/client-payments" element={<RoleRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER']}><ClientPaymentsPage /></RoleRoute>} />
        <Route path="/finance/vendor-payments" element={<RoleRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER']}><ExpensesPage /></RoleRoute>} />
        <Route path="/finance/expenses" element={<RoleRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER', 'EVENT_MANAGER', 'TEAM_MEMBER']}><ExpensesPage /></RoleRoute>} />
        <Route path="/finance/overheads" element={<RoleRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER']}><OverheadsPage /></RoleRoute>} />
        <Route path="/finance/dashboard" element={<RoleRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER']}><FinanceDashboard /></RoleRoute>} />
        <Route path="/finance/petty-cash" element={<RoleRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER']}><PettyCashPage /></RoleRoute>} />

        {/* System (Phase 6) */}
        <Route path="/reports" element={<RoleRoute allowedRoles={['ADMIN', 'EVENT_MANAGER', 'FINANCE_MANAGER']}><ReportsPage /></RoleRoute>} />
        <Route path="/notifications" element={<NotificationsPage />} />

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
