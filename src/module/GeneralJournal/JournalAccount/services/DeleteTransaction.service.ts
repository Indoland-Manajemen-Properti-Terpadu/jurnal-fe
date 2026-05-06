import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { del, get } from '@/services/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';
import { useJournalAccountStore } from '@/store/GeneralJournal/useJournalAccount';
import { notifications } from '@mantine/notifications';

export const useDeleteJurnalAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: any) => {
      const result = await del(API_ACCOUNT.DELETE_ACCOUNT, ids);
      return result;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Selected accounts have been deleted',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};
