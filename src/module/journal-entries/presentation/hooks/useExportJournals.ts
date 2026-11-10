import { useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import type { JournalExportType, JournalHistoryFilters } from '../../domain/journalHistory';
import {
  JournalExportError,
  exportJournalHistory,
  isRequestCanceled,
} from '../../infrastructure/journalEntryApi';

const saveFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

/**
 * Downloads the journal list the person is looking at as xlsx, pdf or csv. One export runs at a
 * time; it can be cancelled, and it stops when the page is left.
 */
export function useExportJournals(filters: JournalHistoryFilters) {
  const { t } = useTranslation('reports');
  const controller = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
  }, []);
  useEffect(() => abort, [abort]);

  const mutation = useMutation({
    mutationFn: (type: JournalExportType) => {
      controller.current?.abort();
      controller.current = new AbortController();
      return exportJournalHistory(
        filters,
        type,
        t('common.exportRetry'),
        controller.current.signal
      );
    },
    onSuccess: ({ blob, filename }, type) => {
      saveFile(blob, filename);
      notifications.show({
        color: 'teal',
        title: t('common.exportSuccess'),
        message: t('common.fileDownloaded', { type: type.toUpperCase() }),
      });
    },
    onError: (error) => {
      if (isRequestCanceled(error)) return;
      // A 400 is the server refusing this request (for example too many journals for a PDF, which
      // names Excel or CSV instead): say it calmly, as it is not a fault.
      const refused = error instanceof JournalExportError && error.status === 400;
      notifications.show({
        color: refused ? 'orange' : 'red',
        title: refused ? t('common.exportNotPossible') : t('common.exportFailed'),
        message: error instanceof Error ? error.message : t('common.exportRetry'),
      });
    },
  });

  const cancel = () => {
    abort();
    notifications.show({ color: 'gray', message: t('common.exportCanceled') });
  };

  return { exportJournals: mutation.mutate, isExporting: mutation.isPending, cancel };
}
