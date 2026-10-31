import { useQuery } from '@tanstack/react-query';
import type { BalanceSheetReport } from '@/module/reports/domain/balanceSheetReport.types';
import { fetchBalanceSheetSummaryReport } from '@/module/reports/infrastructure/businessOverviewApi';

interface BalanceSheetSummaryParams {
  fromDate: string;
  toDate: string;
}

export const useBalanceSheetSummaryReport = ({ fromDate, toDate }: BalanceSheetSummaryParams) =>
  useQuery<BalanceSheetReport>({
    queryKey: ['balance_sheet_report', { fromDate, toDate }],
    queryFn: () => fetchBalanceSheetSummaryReport(fromDate, toDate),
    retry: true,
    enabled: Boolean(fromDate && toDate),
  });
