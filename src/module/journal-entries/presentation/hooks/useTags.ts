import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import type { TagsResponse } from '../../domain/journalEntry';
import { createTag, errorMessage, fetchTags } from '../../infrastructure/journalEntryApi';
import { journalEntryKeys } from './journalEntryKeys';

const tr = (key: string, params?: Record<string, string | number>) =>
  t(key, params, 'journalEntries');

export const useGetTags = (page = 1) =>
  useQuery<TagsResponse>({
    queryKey: [...journalEntryKeys.tags, page],
    queryFn: () => fetchTags(page),
  });

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.tags });
      notifications.show({
        color: 'green',
        title: tr('toast.successTitle'),
        message: tr('toast.tagCreated'),
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        color: 'red',
        title: tr('toast.errorTitle'),
        message: tr('toast.tagFailed', { reason: errorMessage(error, '') }),
      });
    },
  });
};
