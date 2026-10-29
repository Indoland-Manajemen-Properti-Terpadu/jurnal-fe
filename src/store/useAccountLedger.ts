import { JournalAccounts } from '@/module/chart-of-accounts/domain/journalAccount';
import create from 'zustand';

interface AccountStoreState {
  selectedRecords: JournalAccounts[];
  setSelectedRecords: (records: JournalAccounts[]) => void;
}

const useAccountStore = create<AccountStoreState>((set) => ({
  selectedRecords: [],
  setSelectedRecords: (records) => set({ selectedRecords: records }),
}));

export default useAccountStore;
