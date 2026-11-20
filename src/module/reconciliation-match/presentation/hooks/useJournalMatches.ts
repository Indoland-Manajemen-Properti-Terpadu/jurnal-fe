import { useQuery } from '@tanstack/react-query';
import { fetchMatchIdsForJournal } from '../../infrastructure/matchApi';
import { journalMatchKeys } from './matchKeys';

/** The ids of the bank matches a journal is part of. A failed lookup reads as "not reconciled". */
export const useJournalMatches = (journalId: string | undefined) =>
  useQuery({
    queryKey: journalMatchKeys.byJournal(journalId ?? ''),
    queryFn: () => fetchMatchIdsForJournal(journalId as string),
    enabled: Boolean(journalId),
    staleTime: 0,
    retry: false,
  });
