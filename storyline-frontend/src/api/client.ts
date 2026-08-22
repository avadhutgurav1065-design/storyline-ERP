import axios from 'axios';
import type { ApiResponse, LoginRequest, LoginResponse, UserResponse, PageResponse, CreateUserRequest, UpdateUserRequest } from '../types';

// Axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post<ApiResponse<LoginResponse>>('/api/auth/refresh', {
            refreshToken,
          });

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // No refresh token — redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ====================================================
// Auth API
// ====================================================
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken }),

  me: () =>
    api.get<ApiResponse<UserResponse>>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword }),
};

// ====================================================
// Users API
// ====================================================
export const usersApi = {
  list: (params?: { search?: string; active?: boolean; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<UserResponse>>>('/users', { params }),

  get: (id: number) =>
    api.get<ApiResponse<UserResponse>>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    api.post<ApiResponse<UserResponse>>('/users', data),

  update: (id: number, data: UpdateUserRequest) =>
    api.put<ApiResponse<UserResponse>>(`/users/${id}`, data),

  toggleStatus: (id: number) =>
    api.patch<ApiResponse<UserResponse>>(`/users/${id}/status`),
};

// ====================================================
// CRM API
// ====================================================
export const crmApi = {
  // Leads
  listLeads: (params?: { search?: string; status?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<any>>>('/crm/leads', { params }),
  createLead: (data: any) => api.post<ApiResponse<any>>('/crm/leads', data),
  updateLead: (id: number, data: any) => api.put<ApiResponse<any>>(`/crm/leads/${id}`, data),
  convertLead: (id: number, data: any) => api.post<ApiResponse<any>>(`/crm/leads/${id}/convert`, data),

  // Clients
  listClients: (params?: { search?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<any>>>('/crm/clients', { params }),
  createClient: (data: any) => api.post<ApiResponse<any>>('/crm/clients', data),
  updateClient: (id: number, data: any) => api.put<ApiResponse<any>>(`/crm/clients/${id}`, data),
};

// ====================================================
// Sales API
// ====================================================
export const salesApi = {
  listQuotations: (clientId: number, params?: { page?: number; size?: number }) =>
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
  listEvents: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<any>>>('/events', { params }),
  createEvent: (data: any) => api.post<ApiResponse<any>>('/events', data),
};

export default api;
