
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';
import { create } from 'zustand';

interface JournalAccountStore {
    accounts: JournalAccounts[] | null;
    setAccounts: (accounts: JournalAccounts[]) => void;
}

export const useJournalAccountStore = create<JournalAccountStore>((set) => ({
    accounts: null,
    setAccounts: (accounts) => set({ accounts }),
}));
