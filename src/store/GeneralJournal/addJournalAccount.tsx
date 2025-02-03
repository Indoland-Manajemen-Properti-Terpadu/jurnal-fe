import create from 'zustand';

interface AddJournalAccountFormState {
    accountName: string;
    accountNumber: string;
    category: string;
    typeTax: string;
    description: string;
    userAccess: UserAccessType;
    accountType: AccountType;
    setField: (field: 'accountName' | 'accountNumber' | 'category' | 'typeTax' | 'description' | 'userAccess' | 'accountType', value: string) => void;
    resetForm: () => void;
}


export const useAddJournalAccountForm = create<AddJournalAccountFormState>((set) => ({
    accountName: '',
    accountNumber: '',
    category: '',
    typeTax: '',
    description: '',
    userAccess: 'AllUsers',
    accountType: 'SingleAccount',
    setField: (field, value) => set((state) => ({
        ...state,
        [field]: value,
    })),
    resetForm: () => set({
        accountName: '',
        accountNumber: '',
        category: '',
        typeTax: '',
        description: '',
        userAccess: 'AllUsers',
        accountType: 'SingleAccount',
    }),
}));
