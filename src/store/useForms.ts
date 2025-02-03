import { create } from 'zustand';

interface FormState {
  toDate: Date | null;
  setToDate: (date: Date | null) => void;
}

const useFormState = create<FormState>((set) => ({
  toDate: null,
  setToDate: (date) => set({ toDate: date }),
}));

export default useFormState;
