import { useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { useMyGrants } from '@/module/user-management';
import type {
  ProfitLossExportType,
  ProfitLossReport,
} from '@/module/reports/domain/profitLoss.types';
import { assignRoles, visibleLines } from '@/module/reports/domain/profitLossRows';
import {
  ProfitLossRequestError,
  profitLossApi,
} from '@/module/reports/infrastructure/profitLossApi';
import { isRequestCanceled } from '@/module/reports/infrastructure/requestCancel';
import { saveBlob } from '@/module/reports/infrastructure/saveBlob';
import { useAbortableRequest } from './useAbortableRequest';
import { useReportPeriod } from './useReportPeriod';

/** Profit and loss of a period: the statement, its account search, and the export. */
/** Menu id of the profit and loss report on the server; its read right gates the page. */
export const PROFIT_LOSS_MENU_ID = 'JP-GL-PL';

export function useProfitLoss() {
  const { t, currentLanguage } = useTranslation('reports');
  const { can, isReady } = useMyGrants();
  // Until the rights are known nothing is hidden; a server 403 is still handled below.
  const allowed = !isReady || can(PROFIT_LOSS_MENU_ID, 'read');
  const exportRequest = useAbortableRequest();
  const period = useReportPeriod('this_month', exportRequest.abort);
  const [search, setSearch] = useState('');

  const query = useQuery<ProfitLossReport>({
    queryKey: ['profit-loss', period.period.startDate, period.period.endDate, currentLanguage],
    queryFn: ({ signal }) =>
      profitLossApi.getReport(
        period.period,
        { lang: currentLanguage, fallbackMessage: t('profitLoss.loadFailedMessage') },
        signal
      ),
    enabled: allowed,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const lines = useMemo(() => assignRoles(query.data?.rows ?? []), [query.data]);
  const shown = useMemo(() => visibleLines(lines, { search }), [lines, search]);

  const exportMutation = useMutation({
    mutationFn: (type: ProfitLossExportType) =>
      profitLossApi.exportReport(
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
      // A 400 is the server refusing this request (too large a period), not a fault: say it calmly.
      const refused = error instanceof ProfitLossRequestError && error.status === 400;
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
    shown,
    search,
    setSearch,
    exportMutation,
    cancelExport,
  };
}
