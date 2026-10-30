import { randomId } from '@mantine/hooks';
import { create } from 'zustand';
import type { DraftLine } from '../../domain/journalEntry';
import { isJournalBlocked, parseAmountInput, sumAmounts } from '../../domain/journalRules';

export type DraftField = 'account' | 'description' | 'debit' | 'credit';

interface TransactionState {
  disableTransaction: () => boolean;
  minimumTransaction: number;
  transactions: DraftLine[];
  totalDebit: number;
  totalCredit: number;
  notes: string;
  setNotes: (notes: string) => void;
  addTransaction: () => void;
  updateTransaction: (index: number, field: DraftField, value: string | number) => void;
  removeTransaction: (index: number) => void;
  reorderTransaction: (fromIndex: number, toIndex: number) => void;
  resetTransactions: () => void;
}

const emptyLine = (): DraftLine => ({
  account: '',
  description: '',
  debit: 0,
  credit: 0,
  key: randomId(),
});

const totalsOf = (lines: DraftLine[]) => ({
  totalDebit: sumAmounts(lines.map((line) => line.debit)),
  totalCredit: sumAmounts(lines.map((line) => line.credit)),
});

export const useTransactionStore = create<TransactionState>((set, get) => ({
  minimumTransaction: 2,
  transactions: [emptyLine(), emptyLine()],
  notes: '',
  totalDebit: 0,
  totalCredit: 0,
  setNotes: (notes) => set({ notes }),
  disableTransaction: () => isJournalBlocked(get().transactions),
  addTransaction: () => set((state) => ({ transactions: [...state.transactions, emptyLine()] })),
  updateTransaction: (index, field, value) =>
    set((state) => {
      const updatedTransactions = [...state.transactions];
      const isAmount = field === 'debit' || field === 'credit';
      updatedTransactions[index] = {
        ...updatedTransactions[index],
        [field]: isAmount ? parseAmountInput(value) : value,
      };

      return { transactions: updatedTransactions, ...totalsOf(updatedTransactions) };
    }),
  removeTransaction: (index) => {
    if (get().transactions.length > 2) {
      set((state) => {
        const updatedTransactions = state.transactions.filter((_, i) => i !== index);
        return { transactions: updatedTransactions, ...totalsOf(updatedTransactions) };
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
  resetTransactions: () =>
    set({
      transactions: [emptyLine(), emptyLine()],
      notes: '',
      totalDebit: 0,
      totalCredit: 0,
    }),
}));
