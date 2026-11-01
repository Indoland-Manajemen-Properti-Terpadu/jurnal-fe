import { useQuery } from '@tanstack/react-query';
import type { IncomeStatementReport } from '@/module/reports/domain/IncomeStatement.types';
import { fetchIncomeStatementReport } from '@/module/reports/infrastructure/businessOverviewApi';

interface IncomeStatementParams {
  fromDate: string;
  toDate: string;
}

export const useIncomeStatementReport = ({ fromDate, toDate }: IncomeStatementParams) =>
  useQuery<IncomeStatementReport[]>({
    queryKey: ['income_statement_report', { fromDate, toDate }],
    queryFn: () => fetchIncomeStatementReport(fromDate, toDate),
    retry: false,
    enabled: Boolean(fromDate && toDate),
  });
