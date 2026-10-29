// hooks/useBankStatement.ts
import { API_REPORT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { EquityChangeReport } from '../types/EquityChange.types';

interface EquityChangeParams {
  fromDate: string;
  toDate: string;
}

export const GetEquityChangeReport = ({ fromDate, toDate }: EquityChangeParams) => {
  return useQuery<EquityChangeReport>({
    queryKey: ['equity_change_report', { fromDate, toDate }],
    queryFn: async () => {
      const result = await get(API_REPORT.GET_EQUITY_CHANGE_REPORT, { fromDate, toDate });
      return result;
    },
    retry: false,
    enabled: Boolean(fromDate && toDate),
  });
};
