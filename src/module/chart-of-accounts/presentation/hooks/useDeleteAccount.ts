import { useMutation, useQueryClient } from '@tanstack/react-query';
import { t } from '@/i18n';
import { notifications } from '@mantine/notifications';
import { deleteAccounts } from '../../infrastructure/accountApi';
import useAccountStore from './useAccountStore';

const NS = 'chartOfAccounts';

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { setSelectedRecords } = useAccountStore();

  return useMutation({
    mutationFn: (ids: { accountIds: string[] }) => deleteAccounts(ids),
    onSuccess: () => {
      notifications.show({
        title: t('toast.deleteOkTitle', undefined, NS),
        message: t('toast.deleteOkMsg', undefined, NS),
        color: 'green',
      });
      setSelectedRecords([]);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      notifications.show({
        title: t('toast.deleteFailTitle', undefined, NS),
        message: error?.response?.data?.message || t('toast.deleteFailMsg', undefined, NS),
        color: 'red',
      });
    },
  });
};
