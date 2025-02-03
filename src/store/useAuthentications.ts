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
  accessToken: null,
  refreshToken: null,
  userName: null,
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setUserName: (name) => set({ userName: name }),
  clearTokens: () => set({ accessToken: null, refreshToken: null }),
}));
