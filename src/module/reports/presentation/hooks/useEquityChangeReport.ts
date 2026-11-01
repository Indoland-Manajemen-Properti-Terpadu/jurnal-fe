import { useQuery } from '@tanstack/react-query';
import type { EquityChangeReport } from '@/module/reports/domain/EquityChange.types';
import { fetchEquityChangeReport } from '@/module/reports/infrastructure/businessOverviewApi';

interface EquityChangeParams {
  fromDate: string;
  toDate: string;
}

export const useEquityChangeReport = ({ fromDate, toDate }: EquityChangeParams) =>
  useQuery<EquityChangeReport>({
    queryKey: ['equity_change_report', { fromDate, toDate }],
    queryFn: () => fetchEquityChangeReport(fromDate, toDate),
    retry: false,
    enabled: Boolean(fromDate && toDate),
  });
