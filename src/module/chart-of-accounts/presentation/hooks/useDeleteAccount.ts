import { useMutation, useQueryClient } from '@tanstack/react-query';
import { del } from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';
import { notifications } from '@mantine/notifications';
import useAccountStore from '@/store/useAccountLedger';

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { setSelectedRecords } = useAccountStore();

  return useMutation({
    mutationFn: async (ids: { accountIds: string[] }) => {
      const result = await del(API_ACCOUNT.DELETE_ACCOUNT, ids);
      return result;
    },
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
