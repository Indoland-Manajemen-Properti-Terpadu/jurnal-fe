import { useQuery } from '@tanstack/react-query';
import { fetchJournalDetailsForRecon } from '../../infrastructure/reconciliationApi';
import { reconciliationKeys } from './reconciliationKeys';

export const useJournalDetailsForRecon = (bankStatementId: string | null) =>
  useQuery({
    queryKey: reconciliationKeys.journalDetails(bankStatementId),
    queryFn: () => (bankStatementId ? fetchJournalDetailsForRecon(bankStatementId) : []),
    enabled: !!bankStatementId,
    retry: false,
  });
