import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { deleteJournalEntries } from '../../infrastructure/journalEntryApi';
import { journalEntryKeys } from './journalEntryKeys';

const tr = (key: string) => t(key, undefined, 'journalEntries');

/**
 * Deletes the selected entries with N parallel DELETE requests (not atomic). The lists are
 * refreshed on success and on failure, because some of the requests may have gone through.
 */
export const useDeleteJournalEntries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids }: { ids: string[]; idAccount: string }) => deleteJournalEntries(ids),
    onSuccess: () => {
      notifications.show({
        title: tr('toast.successTitle'),
        message: tr('toast.deleteManySuccessMessage'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: tr('toast.errorTitle'),
        message: tr('toast.deleteManyFailedMessage'),
        color: 'red',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.allByAccount });
    },
  });
};
