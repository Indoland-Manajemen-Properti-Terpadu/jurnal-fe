import { API_REPORT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { BalanceSheetReport } from '@/module/reports/domain/balanceSheetReport.types';
import { get } from '@/lib/http/apiClient';

interface BalanceSheetParams {
  fromDate: string;
  toDate: string;
}

export const GetBalanceSheetReport = ({ fromDate, toDate }: BalanceSheetParams) => {
  return useQuery<BalanceSheetReport>({
    queryKey: ['balance_sheet_report', { fromDate, toDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const result = await get(`${API_REPORT.GET_BALANCE_SHEET_REPORT}?${params.toString()}`);
      return result;
    },
    retry: true,
    enabled: Boolean(fromDate && toDate),
  });
};
