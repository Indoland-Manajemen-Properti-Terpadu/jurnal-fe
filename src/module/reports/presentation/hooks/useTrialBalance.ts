import { useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { useMyGrants } from '@/module/user-management';
import { filterTrialBalanceAccounts } from '@/module/reports/domain/trialBalance';
import type {
  TrialBalanceExportType,
  TrialBalanceReport,
} from '@/module/reports/domain/trialBalance.types';
import { ReportRequestError } from '@/module/reports/infrastructure/reportRequest';
import { isRequestCanceled } from '@/module/reports/infrastructure/requestCancel';
import { saveBlob } from '@/module/reports/infrastructure/saveBlob';
import { trialBalanceApi } from '@/module/reports/infrastructure/trialBalanceApi';
import { useAbortableRequest } from './useAbortableRequest';
import { useReportPeriod } from './useReportPeriod';

/** Menu id of the trial balance on the server; its read right gates the page. */
export const TRIAL_BALANCE_MENU_ID = 'JP-GL-TB';

/**
 * Trial balance of a period: every account (the server pages them, all pages are read), a
 * search over them, and the export. The search runs here because the server has no text filter
 * (`accountIds` takes database ids only).
 */
export function useTrialBalance() {
  const { t, currentLanguage } = useTranslation('reports');
  const { can, isReady } = useMyGrants();
  // Until the rights are known nothing is hidden; a server 403 is still handled by the page.
  const allowed = !isReady || can(TRIAL_BALANCE_MENU_ID, 'read');
  const exportRequest = useAbortableRequest();
  const period = useReportPeriod('this_month', exportRequest.abort);
  const [search, setSearch] = useState('');

  const query = useQuery<TrialBalanceReport>({
    queryKey: ['trial-balance', period.period.startDate, period.period.endDate, currentLanguage],
    queryFn: ({ signal }) =>
      trialBalanceApi.getReport(
        period.period,
        { lang: currentLanguage, fallbackMessage: t('trialBalance.loadFailedMessage') },
        signal
      ),
    enabled: allowed,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const accounts = useMemo(
    () => filterTrialBalanceAccounts(query.data?.accounts ?? [], search),
    [query.data, search]
  );

  const exportMutation = useMutation({
    mutationFn: (type: TrialBalanceExportType) =>
      trialBalanceApi.exportReport(
        period.period,
        type,
        { lang: currentLanguage, fallbackMessage: t('common.exportRetry') },
        exportRequest.start()
      ),
    onSuccess: ({ blob, filename }, type) => {
      saveBlob(blob, filename);
      notifications.show({
        color: 'teal',
        title: t('common.exportSuccess'),
        message: t('common.fileDownloaded', { type: type.toUpperCase() }),
      });
    },
    onError: (error) => {
      if (isRequestCanceled(error)) return;
      // A 400 is the server refusing this request (too long a period), not a fault: say it calmly.
      const refused = error instanceof ReportRequestError && error.status === 400;
      notifications.show({
        color: refused ? 'orange' : 'red',
        title: refused ? t('common.exportNotPossible') : t('common.exportFailed'),
        message: error instanceof Error ? error.message : t('common.exportRetry'),
      });
    },
  });

  const cancelExport = () => {
    exportRequest.abort();
    notifications.show({ color: 'gray', message: t('common.exportCanceled') });
  };

  return {
    ...period,
    allowed,
    query,
    report: query.data,
    accounts,
    search,
    setSearch,
    exportMutation,
    cancelExport,
  };
}
