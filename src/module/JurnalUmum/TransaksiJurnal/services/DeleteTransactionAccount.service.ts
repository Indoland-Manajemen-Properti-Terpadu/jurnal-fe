import { API_ACCOUNT } from '@/services/endpoint';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { del } from '@/services/apiClient';
import { notifications } from '@mantine/notifications';

export const DeleteTransactionAccounts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, idAccount }: { ids: string[]; idAccount: string }) => {
      const promises = ids.map((id) => del(`${API_ACCOUNT.DEL_TRANSACTION_ACCOUNT}/${id}`));
      return Promise.all(promises);
    },
    onSuccess: (data, variables) => {
      notifications.show({
        title: 'Success',
        message: 'Selected transactions have been deleted',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['transaction_by_account', variables.idAccount] });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete selected transactions',
        color: 'red',
      });
      console.error(error);
    },
  });
};
