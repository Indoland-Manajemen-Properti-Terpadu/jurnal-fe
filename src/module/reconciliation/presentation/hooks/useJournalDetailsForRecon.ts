import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { JournalDetail } from '../../domain/reconciliation';

export const useJournalDetailsForRecon = (bankStatementId: string | null) => {
  return useQuery<JournalDetail[]>({
    queryKey: ['journal_details_for_recon', bankStatementId],
    queryFn: async () => {
      if (!bankStatementId) return [];
      const url = API_ACCOUNT.GET_JOURNAL_DETAILS_FOR_RECON.replace(
        ':bankStatementId',
        bankStatementId
      );
      const result = await get(url);

      console.log('Journal Details for Recon Raw API Result:', result);

      // Extract array from various possible structures - check most specific first
      // API returns: { code, message, data: { bankStatement, results: [...], page, limit, totalPages, totalResults } }
      if (result?.data && result.data.results && Array.isArray(result.data.results)) {
        console.log('Extracted from result.data.results:', result.data.results);
        return result.data.results;
      }
      if (Array.isArray(result?.results)) return result.results;
      if (Array.isArray(result?.data)) return result.data;
      if (Array.isArray(result)) return result;

      console.log('Failed to extract results from API response');
      return [];
    },
    enabled: !!bankStatementId,
    retry: false,
  });
};
