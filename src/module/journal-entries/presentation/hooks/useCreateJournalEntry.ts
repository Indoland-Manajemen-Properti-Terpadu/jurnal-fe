import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { routes } from '@/router/routes';
import type { JournalEntryPayload } from '../../domain/journalEntry';
import { createJournalEntry } from '../../infrastructure/journalEntryApi';
import { journalEntryKeys } from './journalEntryKeys';

const tr = (key: string) => t(key, undefined, 'journalEntries');

export const useCreateJournalEntry = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, JournalEntryPayload>({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.allByAccount });
      notifications.show({
        color: 'green',
        autoClose: 3500,
        title: tr('toast.createdTitle'),
        message: tr('toast.createdMessage'),
      });
      navigate(routes.chartOfAccounts.main);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        autoClose: 5000,
        title: tr('toast.createFailedTitle'),
        message: `${error.message}`,
      });
    },
  });
};
