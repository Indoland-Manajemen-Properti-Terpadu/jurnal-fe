import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDraftAccount,
  getDraftBalanceLogs,
  postDraftBalance,
  postPublishDraftBalance,
} from '../../infrastructure/SetDraftBalance.service';

export const useDraftAccount = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['draftAccounts'],
    queryFn: getDraftAccount,
  });

  const rawData: any = data?.data || data;

  return {
    draftAccounts: rawData,
    rawResponse: data,
    isLoading,
    isError,
    refetch,
  };
};

export const useDraftBalanceLogs = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['draftBalanceLogs'],
    queryFn: getDraftBalanceLogs,
    enabled,
  });
};

export const useSetDraftBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postDraftBalance,
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        autoClose: 3500,
        title: 'Draf Berhasil Disimpan',
        message: 'Data saldo awal buku besar telah berhasil disimpan sebagai draf.',
      });
      queryClient.invalidateQueries({ queryKey: ['draftAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['draftBalanceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      console.error('Error saving draft balance:', error);
      notifications.show({
        color: 'red',
        autoClose: 4000,
        title: 'Gagal Menyimpan Draf',
        message:
          error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan draf saldo awal.',
      });
    },
  });
};

export const usePublishDraftBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postPublishDraftBalance,
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        autoClose: 4000,
        title: 'Saldo Awal Berhasil Dipublikasikan!',
        message: 'Saldo awal telah dicatat ke dalam buku besar akun.',
      });
      queryClient.invalidateQueries({ queryKey: ['draftAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['draftBalanceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['journalAccounts'] });
    },
    onError: (error: any) => {
      console.error('Error publishing draft balance:', error);
      notifications.show({
        color: 'red',
        autoClose: 4000,
        title: 'Gagal Mempublikasikan Saldo Awal',
        message:
          error?.response?.data?.message ||
          'Terjadi kesalahan saat mempublikasikan saldo awal ke buku besar.',
      });
    },
  });
};
