import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { TransactionJournalPayload } from '@/module/GeneralJournal/DetailAccount/TransactionJournal/types/AddTransactionPayload';
import { routes } from '@/router/routes';
import { postV2 } from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';

type ApiErrorResponse = {
  message?: string;
};

const getApiErrorMessage = (
  response: { data?: ApiErrorResponse; statusText?: string } | null | undefined
) => response?.data?.message ?? response?.statusText ?? 'Unknown Error';

const submitTransactionJournal = async (data: TransactionJournalPayload) => {
  const payload: Record<string, unknown> = {
    transactionDate: data.transactionDate,
    transactionDetail: data.transactionDetail.map((detail) => ({
      account: detail.account,
      description: detail.description,
      ...(detail.debit ? { debit: detail.debit } : {}),
      ...(detail.credit ? { credit: detail.credit } : {}),
    })),
  };

  if (data.transactionNumber !== undefined && !Number.isNaN(data.transactionNumber)) {
    payload.transactionNumber = data.transactionNumber;
  }
  if (data.notes && data.notes.trim().length > 0) {
    payload.notes = data.notes;
  }
  if (data.tags?.length) {
    payload.tags = data.tags;
  }
  if (data.attachments?.length) {
    payload.attachments = data.attachments;
  }

  const response = await postV2(API_ACCOUNT.POST_TRANSACTION_ACCOUNT, payload);
  if (!response || response?.status !== 200) {
    throw new Error(getApiErrorMessage(response));
  }
  return response.data;
};

export const useSubmitTransactionJournal = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, TransactionJournalPayload>({
    mutationFn: submitTransactionJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['journal_transactions'] });
      notifications.show({
        color: 'green',
        autoClose: 3500,
        title: 'Transaksi Berhasil Disimpan',
        message: 'Transaksi jurnal umum telah berhasil dibukukan ke dalam sistem.',
      });
      navigate(routes.generalJournal.main);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        autoClose: 5000,
        title: 'Gagal Menyimpan Transaksi Jurnal',
        message: `${error.message}`,
      });
    },
  });
};
