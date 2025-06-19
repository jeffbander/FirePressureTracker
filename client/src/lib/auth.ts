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
      console.log('Attempting login with:', { username });
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await response.json();
      
      console.log('Login response:', data);
      
      if (data.user) {
        set({ user: data.user, isAuthenticated: true });
        return true;
      } else {
        console.error('No user data in response');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
