import { useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { generalLedgerApi } from '@/module/reports/infrastructure/generalLedgerApi';
import { isRequestCanceled } from '@/module/reports/infrastructure/requestCancel';
import { useAbortableRequest } from '@/module/reports/presentation/hooks/useAbortableRequest';
import type {
  GeneralLedgerExportType,
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { getPresetDateRange, type PeriodPreset } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';

export function useGeneralLedger() {
  const { t } = useTranslation('reports');
  const exportRequest = useAbortableRequest();
  const [preset, setPreset] = useState<PeriodPreset>('this_month');
  const [period, setPeriod] = useState<ReportPeriod>(() => getPresetDateRange('this_month'));
  const [draftPeriod, setDraftPeriod] = useState<ReportPeriod>(() =>
    getPresetDateRange('this_month')
  );

  const [accountSearch, setAccountSearch] = useState('');

  // Change preset helper
  const handlePresetChange = (newPreset: PeriodPreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const range = getPresetDateRange(newPreset);
      setDraftPeriod(range);
      setPeriod(range);
      exportRequest.abort();
    }
  };

  // Apply custom dates
  const handleApplyCustomPeriod = () => {
    if (draftPeriod.startDate > draftPeriod.endDate) {
      notifications.show({
        color: 'red',
        title: t('common.invalidRangeTitle'),
        message: t('common.invalidRangeMessage'),
      });
      return;
    }
    setPreset('custom');
    setPeriod(draftPeriod);
    exportRequest.abort();
  };

  // Query
  const query = useQuery<GeneralLedgerReport>({
    queryKey: ['general-ledger', period.startDate, period.endDate],
    queryFn: ({ signal }) => generalLedgerApi.getReport(period, signal),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const accounts = query.data?.accounts ?? [];

  // Filtered accounts based on search
  const filteredAccounts = useMemo(() => {
    const term = accountSearch.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter(
      (acc) =>
        acc.number.toLowerCase().includes(term) ||
        acc.name.toLowerCase().includes(term) ||
        acc.category.toLowerCase().includes(term)
    );
  }, [accounts, accountSearch]);

  // Check debit-credit balance
  const isBalanced = useMemo(() => {
    if (!query.data) return true;
    const diff = Math.abs(query.data.periodDebitTotal - query.data.periodCreditTotal);
    return diff < 0.01;
  }, [query.data]);

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (type: GeneralLedgerExportType) =>
      generalLedgerApi.exportReport(period, type, exportRequest.start()),
    onSuccess: (blob, type) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `buku-besar_${period.startDate}_sd_${period.endDate}.${type}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      notifications.show({
        color: 'teal',
        title: t('common.exportSuccess'),
        message: t('generalLedger.fileDownloaded', { type: type.toUpperCase() }),
      });
    },
    onError: (err) => {
      if (isRequestCanceled(err)) return;
      notifications.show({
        color: 'red',
        title: t('common.exportFailed'),
        message: err instanceof Error ? err.message : t('generalLedger.exportFailedMessage'),
      });
    },
  });

  const cancelExport = () => {
    exportRequest.abort();
    notifications.show({ color: 'gray', message: t('common.exportCanceled') });
  };

  return {
    period,
    draftPeriod,
    setDraftPeriod,
    preset,
    handlePresetChange,
    handleApplyCustomPeriod,

    query,
    accounts,
    filteredAccounts,

    accountSearch,
    setAccountSearch,

    isBalanced,

    exportMutation,
    cancelExport,
  };
}
