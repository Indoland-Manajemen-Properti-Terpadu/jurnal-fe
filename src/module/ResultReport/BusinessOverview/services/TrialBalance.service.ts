import { API_REPORT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { TrialBalanceReport } from '../types/TrialBalanceReport.types';

export const GetTrialBalanceReport = (fromDate: string, toDate: string) => {
  return useQuery<TrialBalanceReport>({
    queryKey: ['trial_balance_report', { fromDate, toDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const result = await get(`${API_REPORT.GET_TRIAL_BALANCE_REPORT}?${params.toString()}`);
      console.log(result);
      return result;
    },
    retry: false,
    enabled: Boolean(fromDate && toDate),
  });
};
