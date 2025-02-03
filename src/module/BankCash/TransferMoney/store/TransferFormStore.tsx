// stores/useTransactionStore.ts
import { randomId } from '@mantine/hooks';
import { create } from 'zustand';

interface Transaction {
    accountFrom: string;
    accountTo: string;
    ammount: number
    key: string;
}

interface TransactionState {
    minimumTransaction: number;
    transactions: Transaction[];
    ammount: number;
    notes: string;
    setNotes: (notes: string) => void;
    addTransaction: () => void;
    updateTransaction: (index: number, field: string, value: any) => void;
    // disableTransaction: () => boolean;
    // removeTransaction: (index: number) => void;
}

const initialState = {
    transactions: [
        { accountFrom: '', accountTo: '', ammount: 0, key: randomId() },
    ],
};

export const useTransferMoneyStore = create<TransactionState>((set, get) => ({
    minimumTransaction: 1,
    file: [],
    transactions: [
        { accountFrom: '', accountTo: '', ammount: 0, key: randomId() },
    ],
    notes: '',
    ammount: 0,
    setNotes: (notes) => set({ notes }),

    addTransaction: () =>
        set((state) => ({
            transactions: [
                ...state.transactions,
                { accountFrom: '', accountTo: '', ammount: 0, key: randomId() },
            ],
        })),
    updateTransaction: (index, field, value) =>
        set((state) => {
            const updatedTransactions = [...state.transactions];
            updatedTransactions[index] = {
                ...updatedTransactions[index],
                [field]: value,
            };


            return { transactions: updatedTransactions, ammount: 0 };
        }),

    // const totalDebit = updatedTransactions.reduce((acc, trans) => acc + trans.debit, 0);
    // const totalCredit = updatedTransactions.reduce((acc, trans) => acc + trans.credit, 0);

    // disableTransaction: () => {
    //     const { transactions } = get();
    //     const condition = [
    //         transactions.map((ts) => ts.account === '').some((item) => item),
    //         transactions
    //             .map((ts) => parseFloat(`${ts.debit}`) === 0 && parseFloat(`${ts.credit}`) === 0)
    //             .some((item) => item),
    //         transactions
    //             .map((ts) => parseFloat(`${ts.debit}`) - parseFloat(`${ts.credit}`))
    //             .reduce((a, b) => a + b, 0) !== 0,
    //     ];
    //     return condition.some((item) => item);
    // },

    // removeTransaction: (index) => {
    //     if (get().transactions.length > 1) {
    //         set((state) => {
    //             const updatedTransactions = state.transactions.filter((_, i) => i !== index);
    //             const totalDebit = updatedTransactions.reduce((acc, trans) => acc + trans.debit, 0);
    //             const totalCredit = updatedTransactions.reduce((acc, trans) => acc + trans.credit, 0);

    //             return { transactions: updatedTransactions, totalDebit, totalCredit };
    //         });
    //     }
    // },
}));
