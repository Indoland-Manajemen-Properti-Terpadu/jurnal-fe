// stores/useTransactionStore.ts
import { randomId } from '@mantine/hooks';
import { create } from 'zustand';

interface Transaction {
  account: string;
  description: string;
  debit: number;
  credit: number;
  key: string;
}

interface TransactionState {
  disableTransaction: () => boolean;
  minimumTransaction: number;
  transactions: Transaction[];
  totalDebit: number;
  totalCredit: number;
  notes: string;
  setNotes: (notes: string) => void;
  addTransaction: () => void;
  updateTransaction: (index: number, field: string, value: any) => void;
  removeTransaction: (index: number) => void;
  reorderTransaction: (fromIndex: number, toIndex: number) => void;
}

const initialState = {
  transactions: [
    { account: '', description: '', debit: 0, credit: 0, key: randomId() },
    { account: '', description: '', debit: 0, credit: 0, key: randomId() },
  ],
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  minimumTransaction: 2,
  file: [],
  transactions: [
    { account: '', description: '', debit: 0, credit: 0, key: randomId() },
    { account: '', description: '', debit: 0, credit: 0, key: randomId() },
  ],
  notes: '',
  totalDebit: 0,
  totalCredit: 0,
  setNotes: (notes) => set({ notes }),
  disableTransaction: () => {
    const { transactions } = get();
    const condition = [
      transactions.map((ts) => ts.account === '').some((item) => item),
      transactions
        .map((ts) => parseFloat(`${ts.debit}`) === 0 && parseFloat(`${ts.credit}`) === 0)
        .some((item) => item),
      transactions
        .map((ts) => parseFloat(`${ts.debit}`) - parseFloat(`${ts.credit}`))
        .reduce((a, b) => a + b, 0) !== 0,
    ];
    return condition.some((item) => item);
  },
  addTransaction: () =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        { account: '', description: '', debit: 0, credit: 0, key: randomId() },
      ],
    })),
  updateTransaction: (index, field, value) =>
    set((state) => {
      const updatedTransactions = [...state.transactions];
      updatedTransactions[index] = {
        ...updatedTransactions[index],
        [field]: value,
      };

      const totalDebit = updatedTransactions.reduce((acc, trans) => acc + trans.debit, 0);
      const totalCredit = updatedTransactions.reduce((acc, trans) => acc + trans.credit, 0);

      return { transactions: updatedTransactions, totalDebit, totalCredit };
    }),
  removeTransaction: (index) => {
    if (get().transactions.length > 2) {
      set((state) => {
        const updatedTransactions = state.transactions.filter((_, i) => i !== index);
        const totalDebit = updatedTransactions.reduce((acc, trans) => acc + trans.debit, 0);
        const totalCredit = updatedTransactions.reduce((acc, trans) => acc + trans.credit, 0);

        return { transactions: updatedTransactions, totalDebit, totalCredit };
      });
    }
  },
  reorderTransaction: (fromIndex, toIndex) => {
    if (fromIndex === toIndex) {
      return;
    }

    set((state) => {
      const updatedTransactions = [...state.transactions];
      const [movedTransaction] = updatedTransactions.splice(fromIndex, 1);

      if (!movedTransaction) {
        return state;
      }

      updatedTransactions.splice(toIndex, 0, movedTransaction);

      return { transactions: updatedTransactions };
    });
  },
}));
