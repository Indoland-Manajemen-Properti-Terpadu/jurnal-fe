import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import type { UpdateProfileInput } from '../../domain/profile';
import {
  changePassword,
  fetchMyAccess,
  fetchProfile,
  updateProfile,
} from '../../infrastructure/profileApi';

const PROFILE_QUERY_KEY = ['profile'];
const ACCESS_QUERY_KEY = ['profile', 'access'];

export const useGetProfile = () => useQuery({ queryKey: PROFILE_QUERY_KEY, queryFn: fetchProfile });

export const useMyAccess = () => useQuery({ queryKey: ACCESS_QUERY_KEY, queryFn: fetchMyAccess });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('profile');

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      notifications.show({
        color: 'teal',
        title: t('notifications.successTitle'),
        message: t('notifications.saved'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: t('notifications.failedTitle'),
        message: t('notifications.updateFailed'),
      });
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => changePassword(input),
  });
