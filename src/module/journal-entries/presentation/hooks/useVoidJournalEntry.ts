import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { errorMessage, voidJournalEntry } from '../../infrastructure/journalEntryApi';
import { journalEntryKeys } from './journalEntryKeys';

const tr = (key: string, params?: Record<string, string | number>) =>
  t(key, params, 'journalEntries');

/**
 * Voids an entry: the server marks it `VOID` and posts a `REVERSAL` entry. The caller only offers
 * this when `canVoid` is true (see `voidGate`); the server is the final gate.
 */
export const useVoidJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: string; number: string | number }>({
    mutationFn: ({ id }) => voidJournalEntry(id),
    onSuccess: (_result, { number }) => {
      notifications.show({
        color: 'green',
        title: tr('void.successTitle'),
        message: tr('void.successMessage', { number }),
      });
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.allByAccount });
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.allDetails });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['detail_account'] });
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: tr('void.failedTitle'),
        message: errorMessage(error, '') || tr('void.failedMessage'),
      });
    },
  });
};
