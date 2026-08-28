import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import UserManagementPage from './features/users/UserManagementPage';
import LeadsPage from './features/crm/LeadsPage';
import ClientsPage from './features/crm/ClientsPage';
import FollowupsPage from './features/crm/FollowupsPage';
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
        <Route path="/followups" element={<FollowupsPage />} />

        {/* Sales (Phase 2) */}
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/quotations/:id/pdf" element={<QuotationPdfView />} />
        <Route path="/quotation-history" element={<QuotationHistoryPage />} />

        {/* Events (Phase 3) */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/active" element={<ActiveEventsPage />} />
        <Route path="/events/:id" element={<EventDetailsDashboard />} />
        <Route path="/events/calendar" element={<EventCalendarPage />} />
        <Route path="/tasks" element={<TasksPage filter="all" />} />

        {/* Teams Placeholders (Phase 3) */}
        <Route path="/teams" element={<TeamManagementPage />} />
        <Route path="/members" element={<MembersPage />} />

        {/* Vendors Placeholders (Phase 3) */}
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/vendor-assignments" element={<VendorAssignmentsPage />} />

        {/* Tasks Placeholders (Phase 3) */}
        <Route path="/tasks/my" element={<TasksPage filter="my" />} />
        <Route path="/tasks/team" element={<TasksPage filter="team" />} />
        <Route path="/tasks/all" element={<TasksPage filter="all" />} />

        {/* Inventory & Hamper (Phase 5) */}
        <Route path="/hampers" element={<HampersPage />} />
        <Route path="/raw-materials" element={<RawMaterialsPage />} />
        <Route path="/bom" element={<BomPage />} />
        <Route path="/manufacturing" element={<ManufacturingPage />} />
        <Route path="/dispatch" element={<DispatchPage />} />

        {/* Finance (Phase 5) */}
        <Route path="/finance/invoices" element={<InvoicesPage />} />
        <Route path="/finance/client-payments" element={<ClientPaymentsPage />} />
        <Route path="/finance/vendor-payments" element={<ExpensesPage />} />
        <Route path="/finance/expenses" element={<ExpensesPage />} />
        <Route path="/finance/overheads" element={<OverheadsPage />} />
        <Route path="/finance/dashboard" element={<FinanceDashboard />} />
        <Route path="/finance/petty-cash" element={<PettyCashPage />} />

        {/* System (Phase 6) */}
        <Route path="/reports" element={<ReportsPage />} />
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
