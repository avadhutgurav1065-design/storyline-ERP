import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserResponse, LoginRequest } from '../types';
import { authApi } from '../api/client';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { initFirebaseMessaging } = useNotification();

  // On mount, check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  // Apply theme when user data changes
  useEffect(() => {
    if (user?.themePreference) {
      if (user.themePreference === 'dark' || (user.themePreference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }, [user?.themePreference]);

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    const { accessToken, refreshToken, user: userData } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Don't store potentially huge base64 avatar in localStorage to avoid QuotaExceededError
    const userForStorage = { ...userData };
    delete userForStorage.avatarUrl;
    localStorage.setItem('user', JSON.stringify(userForStorage));

    setUser(userData);
    
    // Initialize push notifications now that we are logged in
    initFirebaseMessaging().catch(e => console.warn("Failed to init messaging after login", e));
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.me();
      const userData = response.data.data;
      setUser(userData);
      try {
        const userForStorage = { ...userData };
        delete userForStorage.avatarUrl;
        localStorage.setItem('user', JSON.stringify(userForStorage));
      } catch (e) {
        console.warn('Could not save user to localStorage', e);
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
