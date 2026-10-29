// hooks/useBankStatement.ts
import { API_REPORT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { download, get } from '@/lib/http/apiClient';
import { IncomeStatementReport, DownloadReports } from '../types/IncomeStatement.types';

interface IncomeStatementParams {
  fromDate: string;
  toDate: string;
}

export const GetIncomeStatementReport = ({ fromDate, toDate }: IncomeStatementParams) => {
  return useQuery<IncomeStatementReport[]>({
    queryKey: ['income_statement_report', { fromDate, toDate }],
    queryFn: async () => {
      const result = await get(API_REPORT.GET_INCOME_STATEMENT_REPORT, { fromDate, toDate });
      return result;
    },
    retry: false,
    enabled: Boolean(fromDate && toDate),
  });
};
