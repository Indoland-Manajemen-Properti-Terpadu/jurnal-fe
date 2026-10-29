// src/store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userName: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUserName: (name: string) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  userName: localStorage.getItem('userName'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },
  setUserName: (name) => {
    localStorage.setItem('userName', name);
    set({ userName: name });
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    set({ accessToken: null, refreshToken: null, userName: null });
  },
}));
