import { useQuery } from '@tanstack/react-query';
import type { TrialBalanceReport } from '@/module/reports/domain/TrialBalanceReport.types';
import { fetchTrialBalanceReport } from '@/module/reports/infrastructure/businessOverviewApi';

export const useTrialBalanceReport = (fromDate: string, toDate: string) =>
  useQuery<TrialBalanceReport>({
    queryKey: ['trial_balance_report', { fromDate, toDate }],
    queryFn: () => fetchTrialBalanceReport(fromDate, toDate),
    retry: false,
    enabled: Boolean(fromDate && toDate),
  });
