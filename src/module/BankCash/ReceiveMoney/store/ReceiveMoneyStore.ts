// stores/useTransactionStore.ts
import { GetJournalAccounts } from '@/module/GeneralJournal/JournalAccount/service/AccountJournal.service';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';
import { randomId } from '@mantine/hooks';
import { create } from 'zustand';

interface JournalAccountState {
  journalAccounts: JournalAccounts[];
  fetchJournalAccounts: () => Promise<void>;
}

export const useJournalAccountStore = create<JournalAccountState>((set) => ({
  journalAccounts: [],
  fetchJournalAccounts: async () => {
    const { accounts } = GetJournalAccounts();
    if (Array.isArray(accounts)) {
      set({ journalAccounts: accounts });
    }
  },
}));

interface ReceiveMoney {
  account: string;
  description: string;
  tax: string;
  receive: number;
  sent: number;
  key: string;
}

interface ReceiveMoneyState {
  disableTransaction: () => boolean;
  minimumTransaction: number;
  transactions: ReceiveMoney[];
  totalReceive: number;
  totalSent: number;
  taxEnabled: boolean;
  notes: string;
  setNotes: (notes: string) => void;
  addTransaction: () => void;
  setTaxEnabled: (enabled: boolean) => void;
  updateTransaction: (index: number, field: string, value: any) => void;
  removeTransaction: (index: number) => void;
}

const initialState = {
  transactions: [{ account: '', description: '', receive: 0, sent: 0, key: randomId() }],
};

export const useReceiveMoneyStore = create<ReceiveMoneyState>((set, get) => ({
  minimumTransaction: 1,
  file: [],
  transactions: [{ account: '', description: '', tax: '', receive: 0, sent: 0, key: randomId() }],
  notes: '',
  totalReceive: 0,
  totalSent: 0,
  taxEnabled: false,
  setNotes: (notes) => set({ notes }),

  setTaxEnabled: (enabled: boolean) => {
    set({ taxEnabled: enabled });
    const { transactions } = get();
    const totalWithoutTax = transactions.reduce((acc, trans) => acc + trans.receive, 0);
    const totalReceive = enabled ? totalWithoutTax * 0.89 : totalWithoutTax;
    set({ totalReceive });
  },

  disableTransaction: () => {
    const { transactions } = get();
    const condition = [
      transactions.map((ts) => ts.account === '').some((item) => item),
      transactions.map((ts) => parseFloat(`${ts.receive}`) === 0).some((item) => item),
      transactions.map((ts) => parseFloat(`${ts.receive}`)).reduce((a, b) => a + b, 0) !== 0,
    ];
    return condition.some((item) => item);
  },

  addTransaction: () =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        { account: '', description: '', tax: '', receive: 0, sent: 0, key: randomId() },
      ],
    })),

  updateTransaction: (index, field, value) =>
    set((state) => {
      const updatedTransactions = [...state.transactions];
      updatedTransactions[index] = {
        ...updatedTransactions[index],
        [field]: value,
      };
      const totalWithoutTax = updatedTransactions.reduce((acc, trans) => acc + trans.receive, 0);
      const totalReceive = state.taxEnabled ? totalWithoutTax * 0.89 : totalWithoutTax;
      return { transactions: updatedTransactions, totalReceive };
    }),

  removeTransaction: (index) => {
    if (get().transactions.length > 1) {
      set((state) => {
        const updatedTransactions = state.transactions.filter((_, i) => i !== index);
        const totalWithoutTax = updatedTransactions.reduce((acc, trans) => acc + trans.receive, 0);
        const totalReceive = state.taxEnabled ? totalWithoutTax * 0.89 : totalWithoutTax;
        return { transactions: updatedTransactions, totalReceive };
      });
    }
  },
}));
