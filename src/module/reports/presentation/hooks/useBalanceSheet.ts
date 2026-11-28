import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { balanceSheetApi } from '@/module/reports/infrastructure/balanceSheetApi';
import { isRequestCanceled } from '@/module/reports/infrastructure/requestCancel';
import { useAbortableRequest } from '@/module/reports/presentation/hooks/useAbortableRequest';
import type {
  BalanceSheetComparison,
  BalanceSheetData,
  BalanceSheetExportType,
  BalanceSheetQueryParams,
  BalanceSheetViewMode,
} from '@/module/reports/domain/balanceSheet.types';
import { getPresetDateRange, type PeriodPreset } from '@/module/reports/domain/reportFormat';
import { getProfitLossComparisonRange } from '@/module/reports/domain/profitLossPeriod';
import type { ReportPeriod } from '@/module/reports/domain/generalLedger.types';
import { useTranslation } from '@/i18n';
import { format, parseISO, subMonths, subQuarters, subYears } from 'date-fns';

export type BalanceSheetPreset = PeriodPreset;

export function useBalanceSheet() {
  const { t } = useTranslation('reports');
  const exportRequest = useAbortableRequest();
  const [preset, setPreset] = useState<BalanceSheetPreset>('this_month');
  const [period, setPeriod] = useState<ReportPeriod>(() => getPresetDateRange('this_month'));
  const [searchQuery, setSearchQuery] = useState('');
  const [comparison, setComparison] = useState<BalanceSheetComparison>('none');
  const [customComparePeriod, setCustomComparePeriod] = useState<ReportPeriod>({
    startDate: '',
    endDate: '',
  });
  const [viewMode, setViewMode] = useState<BalanceSheetViewMode>('rinci');
  const [hideZero, setHideZero] = useState(true);

  const comparePeriod = useMemo(() => {
    if (comparison !== 'previous_period' || preset === 'custom') {
      return getProfitLossComparisonRange(comparison, period, customComparePeriod);
    }
    const shift =
      preset === 'this_month' || preset === 'last_month'
        ? subMonths
        : preset === 'this_quarter'
          ? subQuarters
          : subYears;
    return {
      startDate: format(shift(parseISO(period.startDate), 1), 'yyyy-MM-dd'),
      endDate: format(shift(parseISO(period.endDate), 1), 'yyyy-MM-dd'),
    };
  }, [comparison, customComparePeriod, period, preset]);

  const handleComparePeriodChange = (next: ReportPeriod) => {
    setCustomComparePeriod(next);
    setComparison('custom');
    exportRequest.abort();
  };

  const handlePresetChange = (newPreset: BalanceSheetPreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      setPeriod(getPresetDateRange(newPreset));
      exportRequest.abort();
    }
  };

  const handlePeriodChange = (next: ReportPeriod) => {
    if (next.startDate > next.endDate) {
      notifications.show({
        color: 'red',
        title: t('common.invalidRangeTitle'),
        message: t('common.invalidRangeMessage'),
      });
      return;
    }
    setPreset('custom');
    setPeriod(next);
    exportRequest.abort();
  };

  const queryParams: BalanceSheetQueryParams = {
    ...period,
    comparePeriod: comparePeriod ?? undefined,
  };
  const query = useQuery<BalanceSheetData>({
    queryKey: [
      'balance-sheet-report',
      period.startDate,
      period.endDate,
      comparePeriod?.startDate ?? null,
      comparePeriod?.endDate ?? null,
    ],
    queryFn: ({ signal }) => balanceSheetApi.getReport(queryParams, signal),
    staleTime: 60_000,
  });

  const exportMutation = useMutation({
    mutationFn: (type: BalanceSheetExportType) =>
      balanceSheetApi.exportReport(queryParams, type, exportRequest.start(), {
        summary: viewMode === 'ringkas',
        showZero: !hideZero,
      }),
    onSuccess: (blob, type) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `neraca-${period.endDate}.${type}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      notifications.show({
        color: 'teal',
        title: t('common.exportSuccess'),
        message: t('balanceSheet.fileDownloaded', { type: type.toUpperCase() }),
      });
    },
    onError: (error) => {
      if (isRequestCanceled(error)) return;
      notifications.show({
        color: 'red',
        title: t('common.exportFailed'),
        message: error instanceof Error ? error.message : t('balanceSheet.exportFailedMessage'),
      });
    },
  });

  const cancelExport = () => {
    exportRequest.abort();
    notifications.show({ color: 'gray', message: t('common.exportCanceled') });
  };

  return {
    period,
    preset,
    handlePresetChange,
    handlePeriodChange,
    comparison,
    setComparison,
    comparePeriod,
    customComparePeriod,
    setCustomComparePeriod: handleComparePeriodChange,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    hideZero,
    setHideZero,
    query,
    data: query.data,
    exportMutation,
    cancelExport,
  };
}
