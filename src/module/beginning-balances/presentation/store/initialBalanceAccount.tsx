import { create } from 'zustand'

interface InitialBalanceState {
    accounts: Array<{ id: string; debit?: number; credit?: number }>;
    conversionDate: Date | null;
    totalDebit: number;
    totalCredit: number;
    draftStatus: string | null;
    setAccounts: (accountsData: any) => void;
    countData: (accounts: any) => void;
    setConverstion: (date: Date | null) => void;
    setDraftStatus: (status: string | null) => void;
}

export const useInitialBalanceStore = create<InitialBalanceState>((set) => ({
    accounts: [],
    conversionDate: null,
    totalDebit: 0,
    totalCredit: 0,
    draftStatus: null,
    setAccounts: (accountsData) =>
        set({ accounts: accountsData }),
    countData: (accounts) =>
        set(() => {
            const sumDebit = accounts.reduce((acc: any, account: { debit: any; }) => acc + (account.debit ?? 0), 0);
            const sumCredit = accounts.reduce((acc: any, account: { credit: any; }) => acc + (account.credit ?? 0), 0);
            return { totalDebit: sumDebit, totalCredit: sumCredit }
        }),
    setConverstion: (date) => set({ conversionDate: date }),
    setDraftStatus: (status) => set({ draftStatus: status })
}))

