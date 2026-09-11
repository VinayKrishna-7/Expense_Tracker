import { create } from 'zustand';
import { User } from '../types/user';
import { CurrencyCode } from '../types/settings';
import { AuthService, DEMO_USER } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  loginAsDemo: () => Promise<User>;
  register: (name: string, email: string, password?: string, currency?: CurrencyCode) => Promise<User>;
  updateProfile: (updates: Partial<User>) => void;
  logout: () => void;
  checkAuth: () => User | null;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = AuthService.getCurrentUser();

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,

    checkAuth: () => {
      const user = AuthService.getCurrentUser();
      set({ user, isAuthenticated: !!user });
      return user;
    },

    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const user = await AuthService.login(email, password);
        set({ user, isAuthenticated: true, isLoading: false });
        return user;
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    loginAsDemo: async () => {
      set({ isLoading: true });
      try {
        const user = await AuthService.login(DEMO_USER.email, DEMO_USER.passwordHash);
        set({ user, isAuthenticated: true, isLoading: false });
        return user;
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    register: async (name, email, password, currency = 'INR') => {
      set({ isLoading: true });
      try {
        const user = await AuthService.register(name, email, password, currency);
        set({ user, isAuthenticated: true, isLoading: false });
        return user;
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    updateProfile: (updates) => {
      const updated = AuthService.updateProfile(updates);
      if (updated) {
        set({ user: updated });
      }
    },

    logout: () => {
      AuthService.logout();
      set({ user: null, isAuthenticated: false });
    },
  };
});
