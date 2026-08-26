import axios from 'axios';

// We use a relative URL to let Vite proxy handle development and standard relative paths in production
const API_BASE_URL = '/api';

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
};

export const usersApi = {
  list: (params?: any) => api.get<ApiResponse<any>>('/users', { params }),
  create: (data: any) => api.post<ApiResponse<any>>('/users', data),
  updateUserRole: (id: number, role: string) => api.put<ApiResponse<any>>(`/users/${id}/role?role=${role}`, {}),
  toggleStatus: (id: number) => api.patch<ApiResponse<any>>(`/users/${id}/toggle-status`, {}),
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
  list: () => api.get<ApiResponse<any[]>>('/vendors'),
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
export const tasksApi = {
  list: () => api.get<ApiResponse<any[]>>('/tasks'),
  create: (data: any) => api.post<ApiResponse<any>>('/tasks', data),
  update: (id: number, data: any) => api.put<ApiResponse<any>>(`/tasks/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/tasks/${id}`),
};

// ====================================================
// INVENTORY API (Phase 4)
// ====================================================
export const inventoryApi = {
  listProducts: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/inventory/products', { params }),
  createProduct: (data: any) => api.post<ApiResponse<any>>('/inventory/products', data),
  updateProduct: (id: number, data: any) => api.put<ApiResponse<any>>(`/inventory/products/${id}`, data),
  
  listRawMaterials: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/inventory/raw-materials', { params }),
  createRawMaterial: (data: any) => api.post<ApiResponse<any>>('/inventory/raw-materials', data),
  updateRawMaterial: (id: number, data: any) => api.put<ApiResponse<any>>(`/inventory/raw-materials/${id}`, data),
  deleteRawMaterial: (id: number) => api.delete<ApiResponse<void>>(`/inventory/raw-materials/${id}`),
  
  getProductBom: (productId: number) => api.get<ApiResponse<any[]>>(`/inventory/bom/product/${productId}`),
  updateProductBom: (productId: number, data: any[]) => api.put<ApiResponse<any[]>>(`/inventory/bom/product/${productId}`, data),
  
  processManufactureBatch: (data: any) => api.post<ApiResponse<any>>('/inventory/manufacturing/batch', data)
};

// ====================================================
// FINANCE API (Phase 5)
// ====================================================
export const financeApi = {
  listInvoices: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/finance/invoices', { params }),
  createInvoice: (data: any) => api.post<ApiResponse<any>>('/finance/invoices', data),
  updateInvoiceStatus: (id: number, status: string) => api.patch<ApiResponse<any>>(`/finance/invoices/${id}/status?status=${status}`),
  
  listPayments: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/finance/payments', { params }),
  createPayment: (data: any) => api.post<ApiResponse<any>>('/finance/payments', data),
  
  listExpenses: (params?: any) => api.get<ApiResponse<PageResponse<any>>>('/finance/expenses', { params }),
  createExpense: (data: any) => api.post<ApiResponse<any>>('/finance/expenses', data),
  
  getProfitAndLoss: () => api.get<ApiResponse<any>>('/finance/profit-loss')
};

export default api;