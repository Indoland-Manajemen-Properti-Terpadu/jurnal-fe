import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { TransactionJournalPayload } from '@/module/GeneralJournal/DetailAccount/TransactionJournal/types/AddTransactionPayload';
import { routes } from '@/router';
import { postV2 } from '@/services/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';

const submitTransactionJournal = async (data: TransactionJournalPayload) => {
  const formData = new FormData();

  formData.append('transactionNumber', data.transactionNumber.toString());
  formData.append('transactionDate', data.transactionDate);
  data.transactionDetail.forEach((detail, index) => {
    formData.append(`transactionDetail[${index}][account]`, detail.account);
    formData.append(`transactionDetail[${index}][description]`, detail.description);
    if (detail.debit) {
      formData.append(`transactionDetail[${index}][debit]`, detail.debit.toString());
    }
    if (detail.credit) {
      formData.append(`transactionDetail[${index}][credit]`, detail.credit.toString());
    }
  });
  formData.append('notes', data.notes);
  data.attachments.forEach((file) => {
    formData.append('attachments', file);
  });

  const response = await postV2(API_ACCOUNT.POST_TRANSACTION_ACCOUNT, formData);
  if (!response || response?.status !== 200) {
    throw new Error(response?.data?.message ?? response?.statusText ?? 'Unknown Error');
  }
  return response.data;
};

export const useSubmitTransactionJournal = () => {
  const navigate = useNavigate();
  return useMutation<unknown, Error, TransactionJournalPayload>({
    mutationFn: submitTransactionJournal,
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Transaction Journal has been successfully added.',
      });
      navigate(routes.generalJournal.main);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Failed to add Transaction Journal: ${error.message}`,
      });
    },
  });
};
