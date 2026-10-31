import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import type { BankCashTransactionPayload } from '@/module/bank-cash/domain/transactionTypes';
import { submitBankCashTransaction } from '@/module/bank-cash/infrastructure/bankCashTransactionApi';

export const useBankCashTransactionMutation = (successMessage?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, BankCashTransactionPayload>({
    mutationFn: submitBankCashTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['journal_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['detail_account'] });

      notifications.show({
        color: 'teal',
        autoClose: 4000,
        title: 'Transaksi Kas & Bank Berhasil',
        message: successMessage || 'Transaksi telah berhasil dibukukan ke dalam jurnal umum.',
      });

      navigate(routes.BankAndCash.Main);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        autoClose: 5000,
        title: 'Gagal Membukukan Transaksi',
        message: error.message || 'Terjadi kesalahan pada server saat mencatat transaksi.',
      });
    },
  });
};
