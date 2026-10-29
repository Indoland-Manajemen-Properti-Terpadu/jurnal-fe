

import { create } from 'zustand';
import { DraftAccount } from '../../domain/DraftAccount.types';

interface DraftJournalStore {
    draftAccounts: DraftAccount[] | null;
    setDraftAccounts: (draftAccounts: DraftAccount[]) => void;
}

export const useDraftAccountStore = create<DraftJournalStore>((set) => ({
    draftAccounts: null,
    setDraftAccounts: (draftAccounts) => set({ draftAccounts }),
}));
