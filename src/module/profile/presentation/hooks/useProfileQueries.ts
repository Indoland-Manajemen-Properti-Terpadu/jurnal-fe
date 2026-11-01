import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { fetchProfile, updateProfile } from '../../infrastructure/profileApi';

const PROFILE_QUERY_KEY = ['profile'];

export const useGetProfile = () =>
  useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('profile');

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      notifications.show({
        color: 'teal',
        title: t('notifications.successTitle'),
        message: t('notifications.saved'),
      });
    },
    onError: (error: Error) => {
      notifications.show({
        color: 'red',
        title: t('notifications.failedTitle'),
        message: error.message || t('notifications.updateFailed'),
      });
    },
  });
};
