import { useQuery } from '@tanstack/react-query';
import type { JournalEntryDetail } from '../../domain/journalEntry';
import { fetchJournalEntryDetail } from '../../infrastructure/journalEntryApi';
import { journalEntryKeys } from './journalEntryKeys';

export const useJournalEntryDetail = (idEntry: string) => {
  const { data, isLoading, isError } = useQuery<JournalEntryDetail>({
    queryKey: journalEntryKeys.detail(idEntry),
    queryFn: () => fetchJournalEntryDetail(idEntry),
    enabled: !!idEntry,
  });

  return {
    journalEntry: data || null,
    isLoading,
    isError,
  };
};
