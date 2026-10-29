import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { deleteAccounts } from '../../infrastructure/accountApi';
import useAccountStore from './useAccountStore';

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { setSelectedRecords } = useAccountStore();

  return useMutation({
    mutationFn: (ids: { accountIds: string[] }) => deleteAccounts(ids),
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Selected accounts have been deleted',
        color: 'green',
      });
      setSelectedRecords([]);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to delete accounts',
        color: 'red',
      });
    },
  });
};
