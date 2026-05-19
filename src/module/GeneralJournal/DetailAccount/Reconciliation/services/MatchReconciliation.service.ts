import { API_ACCOUNT } from '@/services/endpoint';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '@/services/apiClient';
import { notifications } from '@mantine/notifications';
import { themeColors } from '@/theme';

export interface MatchPayload {
  matches: {
    bankStatementId: string;
    journalDetailId: string;
  }[];
}

export const useMatchReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MatchPayload) => {
      return await post(API_ACCOUNT.MATCH_RECONCILIATION, payload);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Sukses',
        message: 'Transaksi berhasil direkonsiliasi',
        color: themeColors.figmaTeal[6],
      });
      queryClient.invalidateQueries({ queryKey: ['get_reconciliation'] });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Gagal',
        message: error?.response?.data?.message || 'Gagal melakukan rekonsiliasi',
        color: themeColors.red[6],
      });
    },
  });
};
