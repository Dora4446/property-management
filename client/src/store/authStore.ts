import { create } from 'zustand';
import api from '../services/api';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (formData: any) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  isAdmin: () => boolean;
  isOwner: () => boolean;
  isManager: () => boolean;
  isAgent: () => boolean;
  isTenant: () => boolean;
}

const getStoredUser = (): User | null => {
  const item = localStorage.getItem('propertyhub_user');
  if (!item) return null;
  try {
    return JSON.parse(item);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem('propertyhub_token'),
  isAuthenticated: Boolean(localStorage.getItem('propertyhub_token')),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data.data;

      localStorage.setItem('propertyhub_token', accessToken);
      localStorage.setItem('propertyhub_user', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', formData);
      const { user, accessToken } = res.data.data;

      localStorage.setItem('propertyhub_token', accessToken);
      localStorage.setItem('propertyhub_user', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('propertyhub_token');
    localStorage.removeItem('propertyhub_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('propertyhub_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const res = await api.get('/auth/profile');
      const user = res.data.data.user;
      localStorage.setItem('propertyhub_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      get().logout();
    }
  },

  isAdmin: () => get().user?.role === 'ADMIN',
  isOwner: () => get().user?.role === 'PROPERTY_OWNER',
  isManager: () => get().user?.role === 'PROPERTY_MANAGER',
  isAgent: () => get().user?.role === 'AGENT',
  isTenant: () => get().user?.role === 'TENANT',
}));
