import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import { postV2 } from '@/services/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';

export interface BankCashDetailItem {
  account: string;
  description: string;
  debit?: number;
  credit?: number;
}

export interface BankCashTransactionPayload {
  transactionDate: string;
  transactionNumber?: number;
  notes?: string;
  tags?: string[];
  transactionDetail: BankCashDetailItem[];
}

export const submitBankCashTransaction = async (data: BankCashTransactionPayload) => {
  const payload: Record<string, unknown> = {
    transactionDate: data.transactionDate,
    transactionDetail: data.transactionDetail.map((detail) => ({
      account: detail.account,
      description: detail.description,
      ...(detail.debit !== undefined ? { debit: detail.debit } : {}),
      ...(detail.credit !== undefined ? { credit: detail.credit } : {}),
    })),
  };

  if (data.transactionNumber !== undefined && !Number.isNaN(data.transactionNumber)) {
    payload.transactionNumber = data.transactionNumber;
  }
  if (data.notes && data.notes.trim().length > 0) {
    payload.notes = data.notes.trim();
  }
  if (data.tags && data.tags.length > 0) {
    payload.tags = data.tags;
  }

  const response = await postV2(API_ACCOUNT.POST_TRANSACTION_ACCOUNT, payload);
  if (!response || (response.status !== 200 && response.status !== 201)) {
    const errorMsg =
      response?.data?.message ||
      response?.statusText ||
      'Gagal membukukan transaksi kas & bank ke sistem akuntansi.';
    throw new Error(errorMsg);
  }
  return response.data;
};

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
