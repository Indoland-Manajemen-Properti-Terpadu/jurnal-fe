import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
} from '@/module/settings/infrastructure/settingApi';
import type { TagListParams } from '@/module/settings/domain/settingTypes';

import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';

import { useTranslation } from '@/i18n';

export const useTags = (params?: TagListParams) =>
  useQuery({
    queryKey: settingKeys.tags(params),
    queryFn: () => fetchTags(params),
  });

export const useCreateTag = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; color?: string }) => createTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.tag.created'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.tag.createFailed'),
      });
    },
  });
};

export const useUpdateTag = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; color?: string } }) =>
      updateTag(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.tag.updated'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.tag.updateFailed'),
      });
    },
  });
};

export const useDeleteTag = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.tag.deleted'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.tag.deleteFailed'),
      });
    },
  });
};
