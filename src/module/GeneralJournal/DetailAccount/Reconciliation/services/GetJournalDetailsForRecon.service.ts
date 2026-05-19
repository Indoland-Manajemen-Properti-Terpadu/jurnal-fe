import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';
import { JournalDetail } from '../types/GetReconciliationModel';

export const useGetJournalDetailsForRecon = (bankStatementId: string | null) => {
  return useQuery<JournalDetail[]>({
    queryKey: ['journal_details_for_recon', bankStatementId],
    queryFn: async () => {
      if (!bankStatementId) return [];
      const url = API_ACCOUNT.GET_JOURNAL_DETAILS_FOR_RECON.replace(':bankStatementId', bankStatementId);
      const result = await get(url);
      
      console.log("Journal Details for Recon Raw API Result:", result);
      
      // Extract array from various possible structures
      if (Array.isArray(result?.data)) return result.data;
      if (Array.isArray(result?.data?.results)) return result.data.results;
      if (Array.isArray(result)) return result;
      
      return [];
    },
    enabled: !!bankStatementId,
    retry: false,
  });
};
