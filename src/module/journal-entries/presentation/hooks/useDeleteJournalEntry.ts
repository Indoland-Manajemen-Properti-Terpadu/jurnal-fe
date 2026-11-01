import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { deleteJournalEntry } from '../../infrastructure/journalEntryApi';
import { journalEntryKeys } from './journalEntryKeys';

const tr = (key: string) => t(key, undefined, 'journalEntries');

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idEntry: string) => deleteJournalEntry(idEntry),
    onSuccess: () => {
      notifications.show({
        title: tr('toast.successTitle'),
        message: tr('toast.deleteOneSuccessMessage'),
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.allByAccount });
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.allDetails });
    },
    onError: () => {
      notifications.show({
        title: tr('toast.errorTitle'),
        message: tr('toast.deleteOneFailedMessage'),
        color: 'red',
      });
    },
  });
};
