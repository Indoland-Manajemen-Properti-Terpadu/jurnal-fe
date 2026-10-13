import { create } from 'zustand';

type ApiLoadingStore = {
  pendingRequests: number;
  startRequest: () => void;
  finishRequest: () => void;
};

export const useApiLoadingStore = create<ApiLoadingStore>((set) => ({
  pendingRequests: 0,
  startRequest: () =>
    set((state) => ({
      pendingRequests: state.pendingRequests + 1,
    })),
  finishRequest: () =>
    set((state) => ({
      pendingRequests: Math.max(0, state.pendingRequests - 1),
    })),
}));
