import { create } from 'zustand';

interface InitialBalanceState {
  conversionDate: Date | null;
  setConversionDate: (date: Date | null) => void;
}

/** Conversion (cut-off) date chosen in the start modal and carried to the opening balance page. */
export const useInitialBalanceStore = create<InitialBalanceState>((set) => ({
  conversionDate: null,
  setConversionDate: (date) => set({ conversionDate: date }),
}));
