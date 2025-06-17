import { create } from 'zustand';
import { apiRequest } from './queryClient';

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (username: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await response.json();
      
      set({ user: data.user, isAuthenticated: true });
      return true;
    } catch (error) {
      return false;
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
