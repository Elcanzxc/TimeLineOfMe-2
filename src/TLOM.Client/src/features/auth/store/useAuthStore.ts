import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isProfileCompleted: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  updateUser: (userUpdates: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken, user) => 
        set({ accessToken, refreshToken, user, isAuthenticated: true }),
        
      setAccessToken: (accessToken) => 
        set({ accessToken }),

      updateUser: (userUpdates) => 
        set((state) => ({ user: state.user ? { ...state.user, ...userUpdates } : null })),

      logout: () => 
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'tlom-auth-storage', // key in localStorage
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken, 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
