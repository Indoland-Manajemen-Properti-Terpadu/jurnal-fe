import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { voidJournalEntries, type VoidManyResult } from '../../infrastructure/journalEntryApi';
import { journalEntryKeys } from './journalEntryKeys';

const tr = (key: string, params?: Record<string, string | number>) =>
  t(key, params, 'journalEntries');

/**
 * Voids the selected entries one by one and reports how many went through. The lists are
 * refreshed whatever the outcome, because part of the batch may have been voided.
 */
export const useVoidJournalEntries = () => {
  const queryClient = useQueryClient();

  return useMutation<VoidManyResult, Error, { ids: string[]; idAccount: string }>({
    mutationFn: ({ ids }) => voidJournalEntries(ids),
    onSuccess: ({ voided, failed }) => {
      if (failed === 0) {
        notifications.show({
          color: 'green',
          title: tr('void.successTitle'),
          message: tr('void.manySuccessMessage', { count: voided }),
        });
      } else {
        notifications.show({
          color: voided > 0 ? 'orange' : 'red',
          title: tr('void.failedTitle'),
          message: tr('void.manyPartialMessage', { voided, failed }),
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.allByAccount });
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.allDetails });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['detail_account'] });
    },
  });
};
