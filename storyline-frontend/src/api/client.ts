import axios from 'axios';

// We hardcode the production URL so we don't have to deal with Vercel Environment Variable warnings!
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://storyline-erp-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Generic API response structure matches our backend ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Pagination structure matches our backend PageResponse<T>
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ====================================================
// AUTH API
// ====================================================
export const authApi = {
  login: (data: any) => api.post<ApiResponse<any>>('/auth/login', data),
  me: () => api.get<ApiResponse<any>>('/auth/me'),
  updateProfile: (data: any) => api.put<ApiResponse<any>>('/auth/me', data),
  changePassword: (data: any) => api.post<ApiResponse<any>>('/auth/change-password', data),
  getRecentActivities: () => api.get<ApiResponse<any[]>>('/auth/me/activities'),
};

export const usersApi = {
  list: (params?: any) => api.get<ApiResponse<any>>('/users', { params }),
  create: (data: any) => api.post<ApiResponse<any>>('/users', data),
  update: (id: number, data: any) => api.put<ApiResponse<any>>(`/users/${id}`, data),
  toggleStatus: (id: number) => api.patch<ApiResponse<any>>(`/users/${id}/status`, {}),
  delete: (id: number) => api.delete<ApiResponse<any>>(`/users/${id}`),
};

// ====================================================
// CRM API (Phase 2)
// ====================================================
export const crmApi = {
  // Leads
  listLeads: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/crm/leads', { params }),
  getLead: (id: number) => api.get<ApiResponse<any>>(`/crm/leads/${id}`),
  createLead: (data: any) => api.post<ApiResponse<any>>('/crm/leads', data),
  updateLead: (id: number, data: any) => api.put<ApiResponse<any>>(`/crm/leads/${id}`, data),
  deleteLead: (id: number) => api.delete<ApiResponse<any>>(`/crm/leads/${id}`),
  convertLead: (id: number, data: any) => api.post<ApiResponse<any>>(`/crm/leads/${id}/convert`, data),
  
  // Follow-ups
  getLeadFollowUps: (leadId: number) => api.get<ApiResponse<any[]>>(`/crm/leads/${leadId}/follow-ups`),
  createFollowUp: (data: any) => api.post<ApiResponse<any>>('/crm/follow-ups', data),
  
  // Clients
  listClients: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/crm/clients', { params }),
  getClient: (id: number) => api.get<ApiResponse<any>>(`/crm/clients/${id}`),
  createClient: (data: any) => api.post<ApiResponse<any>>('/crm/clients', data),
  updateClient: (id: number, data: any) => api.put<ApiResponse<any>>(`/crm/clients/${id}`, data),
  getClientFollowUps: (clientId: number) => api.get<ApiResponse<any[]>>(`/crm/clients/${clientId}/follow-ups`),
};

// ====================================================
// SALES API (Phase 2)
// ====================================================
export const salesApi = {
  listQuotations: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/sales/quotations', { params }),
  getQuotationsByClient: (clientId: number, params?: any) => 
    api.get<ApiResponse<PageResponse<any>>>(`/sales/quotations/client/${clientId}`, { params }),
  createQuotation: (data: any) => api.post<ApiResponse<any>>('/sales/quotations', data),
  updateQuotation: (id: number, data: any) => api.put<ApiResponse<any>>(`/sales/quotations/${id}`, data),
  createVersion: (id: number) => api.post<ApiResponse<any>>(`/sales/quotations/${id}/versions`),
  updateStatus: (id: number, status: string) => api.patch<ApiResponse<any>>(`/sales/quotations/${id}/status?status=${status}`),
};

// ====================================================
// EVENTS API
// ====================================================
export const eventsApi = {
  listEvents: (params?: any) =>
    api.get<ApiResponse<PageResponse<any>>>('/events', { params }),
  createEvent: (data: any) => api.post<ApiResponse<any>>('/events', data),
  updateEvent: (id: number, data: any) => api.put<ApiResponse<any>>(`/events/${id}`, data),
  getEventDashboard: (id: number) => api.get<ApiResponse<any>>(`/events/${id}/dashboard`),
};

// ====================================================
// VENDORS API
// ====================================================
export const vendorsApi = {
  list: () => api.get<ApiResponse<any>>('/vendors'),
  create: (data: any) => api.post<ApiResponse<any>>('/vendors', data),
  update: (id: number, data: any) => api.put<ApiResponse<any>>(`/vendors/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/vendors/${id}`),
};

// ====================================================
// VENDOR ASSIGNMENTS API
// ====================================================
export const vendorAssignmentsApi = {
  getByEvent: (eventId: number) => api.get<ApiResponse<any[]>>(`/vendor-assignments/event/${eventId}`),
  assign: (data: any) => api.post<ApiResponse<any>>('/vendor-assignments', data),
  update: (id: number, data: any) => api.put<ApiResponse<any>>(`/vendor-assignments/${id}`, data),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/vendor-assignments/${id}`),
};

// ====================================================
// TEAM ASSIGNMENTS API
// ====================================================
export const teamAssignmentsApi = {
  getByEvent: (eventId: number) => api.get<ApiResponse<any[]>>(`/team-assignments/event/${eventId}`),
  assign: (data: any) => api.post<ApiResponse<any>>('/team-assignments', data),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/team-assignments/${id}`),
};

// ====================================================
// TASKS API
// ====================================================

// --- Inventory API ---
export const inventoryApi = {
  // Products / Hampers
  listProducts: (params?: any) => api.get<ApiResponse<any>>('/inventory/products', { params }),
  createProduct: (data: any) => api.post<ApiResponse<any>>('/inventory/products', data),
  updateProduct: (id: number, data: any) => api.put<ApiResponse<any>>(`/inventory/products/${id}`, data),
  
  // Raw Materials
  listMaterials: (params?: any) => api.get<ApiResponse<any>>('/inventory/raw-materials', { params }),
  createMaterial: (data: any) => api.post<ApiResponse<any>>('/inventory/raw-materials', data),
  updateMaterial: (id: number, data: any) => api.put<ApiResponse<any>>(`/inventory/raw-materials/${id}`, data),
  addStock: (id: number, payload: { quantity: number, type: string, reference?: string, notes?: string }) => 
    api.post<ApiResponse<any>>(`/inventory/raw-materials/${id}/stock`, null, { params: payload }),

  // Bill of Materials (BOM)
  getBom: (productId: number) => api.get<ApiResponse<any[]>>(`/inventory/products/${productId}/bom`),
  addBomItem: (productId: number, payload: { rawMaterialId: number, quantity: number }) => 
    api.post<ApiResponse<any>>(`/inventory/products/${productId}/bom`, payload),
  removeBomItem: (bomId: number) => api.delete<ApiResponse<void>>(`/inventory/bom/${bomId}`),

  // Production
  produceHamper: (productId: number, payload: { quantity: number, reference?: string }) =>
    api.post<ApiResponse<void>>(`/inventory/products/${productId}/produce`, null, { params: payload }),
    
  issueHamper: (productId: number, payload: { quantity: number, eventId: number, reference?: string }) =>
    api.post<ApiResponse<void>>(`/inventory/products/${productId}/issue`, null, { params: payload }),
    
  // Dispatches
  dispatchToEvent: (data: any) => api.post<ApiResponse<any>>('/inventory/dispatch', data),
  getDispatchLogsByEventId: (eventId: number) => api.get<ApiResponse<any>>(`/inventory/dispatch/event/${eventId}`)
};

export const tasksApi = {
  list: (params?: any) => api.get<ApiResponse<any[]>>('/tasks', { params }),
  create: (data: any) => api.post<ApiResponse<any>>('/tasks', data),
  update: (id: number, data: any) => api.put<ApiResponse<any>>(`/tasks/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/tasks/${id}`),
};

export const lookupsApi = {
  users: () => api.get<ApiResponse<any[]>>('/lookups/users'),
  events: () => api.get<ApiResponse<any[]>>('/lookups/events'),
  clients: () => api.get<ApiResponse<any[]>>('/lookups/clients'),
  vendors: () => api.get<ApiResponse<any[]>>('/lookups/vendors'),
  products: () => api.get<ApiResponse<any[]>>('/lookups/products'),
};


// ====================================================
// FINANCE API (Phase 5)
// ====================================================
export const financeApi = {
  listInvoices: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/finance/invoices', { params }),
  getInvoice: (id: number) => api.get<ApiResponse<any>>(`/finance/invoices/${id}`),
  createInvoice: (data: any) => api.post<ApiResponse<any>>('/finance/invoices', data),
  updateInvoice: (id: number, data: any) => api.put<ApiResponse<any>>(`/finance/invoices/${id}`, data),
  createInvoiceSchedule: (data: any[]) => api.post<ApiResponse<any[]>>('/finance/invoices/schedule', data),
  updateInvoiceStatus: (id: number, status: string) => api.patch<ApiResponse<any>>(`/finance/invoices/${id}/status?status=${status}`),
  
  listPayments: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/finance/payments', { params }),
  createPayment: (data: any) => api.post<ApiResponse<any>>('/finance/payments', data),
  
  listExpenses: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/finance/expenses', { params }),
  createExpense: (data: any) => api.post<ApiResponse<any>>('/finance/expenses', data),
  updateExpense: (id: number, data: any) => api.put<ApiResponse<any>>(`/finance/expenses/${id}`, data),
  
  getProfitAndLoss: () => api.get<ApiResponse<any>>('/finance/profit-loss'),
  getEventProfitAndLoss: (eventId: number) => api.get<ApiResponse<any>>(`/finance/events/${eventId}/profit-loss`),
  
  // Petty Cash
  listPettyCashTransactions: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/finance/petty-cash', { params }),
  recordPettyCashTransaction: (data: any) => api.post<ApiResponse<any>>('/finance/petty-cash', data),
  getPettyCashBalance: () => api.get<ApiResponse<number>>('/finance/petty-cash/balance')
};

// ====================================================
// NOTIFICATIONS API (Phase 6)
// ====================================================
export const notificationsApi = {
  getMyNotifications: () => api.get<ApiResponse<any[]>>('/notifications'),
  getUnreadNotifications: () => api.get<ApiResponse<any[]>>('/notifications/unread'),
  markAsRead: (id: number) => api.post<ApiResponse<void>>(`/notifications/${id}/read`),
  markAllAsRead: () => api.post<ApiResponse<void>>('/notifications/read-all'),
  registerDeviceToken: (token: string) => api.post<ApiResponse<void>>('/notifications/tokens', { token }),
};

export const dashboardApi = {
  getStats: () => api.get<ApiResponse<any>>('/dashboard/stats'),
};

export default api;