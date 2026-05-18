import { create } from 'zustand';
import { AccountImportItem, WrongDataItem } from '../types/AccountImport.model';

interface AccountImportState {
  showAlert: boolean;
  totalData: AccountImportItem[];
  correctData: AccountImportItem[];
  wrongData: WrongDataItem[];
  wrongMessages: string[][];
  
  setShowAlert: (status: boolean) => void;
  setImportData: (data: {
    totalData: AccountImportItem[];
    correctData: AccountImportItem[];
    wrongData: WrongDataItem[];
    wrongMessages: string[][];
  }) => void;
  updateItem: (id: number, updatedItem: Partial<AccountImportItem>) => void;
  deleteItem: (id: number) => void;
}

export const useAccountImportStore = create<AccountImportState>((set) => ({
  showAlert: false,
  totalData: [],
  correctData: [],
  wrongData: [],
  wrongMessages: [],

  setShowAlert: (status) => set({ showAlert: status }),
  
  setImportData: (data) => set({
    totalData: data.totalData,
    correctData: data.correctData,
    wrongData: data.wrongData,
    wrongMessages: data.wrongMessages,
    showAlert: data.wrongMessages.length > 0
  }),

  updateItem: (id, updatedItem) => set((state) => {
    const totalData = state.totalData.map((item) => 
      item.id === id ? { ...item, ...updatedItem } : item
    );
    const correctData = state.correctData.map((item) => 
      item.id === id ? { ...item, ...updatedItem } : item
    );
    // Note: wrongData has 'item' property
    const wrongData = state.wrongData.map((wd) => 
      wd.item.id === id ? { ...wd, item: { ...wd.item, ...updatedItem } } : wd
    );

    return { totalData, correctData, wrongData };
  }),

  deleteItem: (id) => set((state) => {
    const totalData = state.totalData.filter((item) => item.id !== id);
    const correctData = state.correctData.filter((item) => item.id !== id);
    const wrongData = state.wrongData.filter((wd) => wd.item.id !== id);
    
    return { totalData, correctData, wrongData };
  }),
}));
