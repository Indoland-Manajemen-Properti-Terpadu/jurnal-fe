import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { JournalHistoryFilters, JournalHistoryPage } from '../../domain/journalHistory';
import { fetchJournalHistory } from '../../infrastructure/journalEntryApi';
import { journalEntryKeys } from './journalEntryKeys';

/** One page of the journal history; the previous page stays on screen while the next one loads. */
export const useJournalHistory = (filters: JournalHistoryFilters) =>
  useQuery<JournalHistoryPage>({
    queryKey: journalEntryKeys.history(filters),
    queryFn: ({ signal }) => fetchJournalHistory(filters, signal),
    placeholderData: keepPreviousData,
  });
