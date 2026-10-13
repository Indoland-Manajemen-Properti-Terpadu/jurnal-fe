import { API_ACCOUNT } from '@/services/endpoint';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '@/services/apiClient';
import { notifications } from '@mantine/notifications';
import { themeColors } from '@/theme';

export interface MatchPayload {
  matches: {
    bankStatementId: string;
    journalDetailIds: string[];
  }[];
}

export const useMatchReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MatchPayload) => {
      const response = await post(API_ACCOUNT.MATCH_RECONCILIATION, payload);
      // Since our apiClient catch block returns error.response instead of throwing, we need to handle it here.
      // Assume success if there is no error response shape (like status >= 400).
      if (response && response.status && response.status >= 400) {
        throw response;
      }
      return response;
    },
    onSuccess: (data, variables) => {
      notifications.show({
        title: 'Sukses',
        message: 'Transaksi berhasil direkonsiliasi',
        color: themeColors.green[6],
      });
      // Invalidate ALL reconciliation data queries regardless of idAccount
      queryClient.invalidateQueries({
        queryKey: ['get_reconciliation'],
        exact: false, // Match partial keys
      });
      // Invalidate bank statement queries to refresh the table
      queryClient.invalidateQueries({
        queryKey: ['bank_statement'],
        exact: false,
      });
      // Also invalidate journal details queries
      queryClient.invalidateQueries({
        queryKey: ['get_journal_details_for_recon'],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ['transaction_by_account'] });
      queryClient.invalidateQueries({ queryKey: ['detail_account'] });
    },
    onError: (error: any) => {
      // The error object here will be the Axios error response returned by our post catch block
      const errorMessage = error?.data?.message || error?.message || 'Gagal melakukan rekonsiliasi';
      notifications.show({
        title: 'Gagal',
        message: errorMessage,
        color: themeColors.red[6],
      });
    },
  });
};
