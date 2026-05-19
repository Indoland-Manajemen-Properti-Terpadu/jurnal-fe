import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  selectedDate: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedDate: (date: string | null) => void;
}

const useFilterTransaction = create<FilterState>((set) => ({
  searchQuery: '',
  selectedDate: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  resetSelection: () => set({ searchQuery: '', selectedDate: null }),
}));

export default useFilterTransaction;
