import { useQuery } from '@tanstack/react-query';
import type { JournalEntryByAccount } from '../../domain/journalEntry';
import { fetchJournalEntriesByAccount } from '../../infrastructure/journalEntryApi';
import { journalEntryKeys } from './journalEntryKeys';

export const useJournalEntriesByAccount = (idAccount: string) =>
  useQuery<JournalEntryByAccount[]>({
    queryKey: journalEntryKeys.byAccount(idAccount),
    queryFn: () => fetchJournalEntriesByAccount(idAccount),
    enabled: !!idAccount,
  });
