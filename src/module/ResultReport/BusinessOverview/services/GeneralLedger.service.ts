// hooks/useBankStatement.ts
import { API_REPORT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';
import { GeneralLedgerReport } from '../types/GeneralLedger.types';

interface GeneralLedgerParams {
  fromDate: string;
  toDate: string;
}

export const GetGeneralLedgerReport = ({ fromDate, toDate }: GeneralLedgerParams) => {
  return useQuery<GeneralLedgerReport[]>({
    queryKey: ['general_ledger_report', { fromDate, toDate }],
    queryFn: async () => {
      const result = await get(API_REPORT.GET_GENERAL_JOURNAL_REPORT, { fromDate, toDate });
      return result;
    },
    retry: false,
    enabled: Boolean(fromDate && toDate),
  });
};
