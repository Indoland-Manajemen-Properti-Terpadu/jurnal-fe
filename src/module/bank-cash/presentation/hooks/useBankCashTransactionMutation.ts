import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import type { BankCashTransactionPayload } from '@/module/bank-cash/domain/transactionTypes';
import { submitBankCashTransaction } from '@/module/bank-cash/infrastructure/bankCashTransactionApi';

import { useTranslation } from '@/i18n';

export const useBankCashTransactionMutation = (successMessage?: string) => {
  const { t: tb } = useTranslation('bankCash');
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
        title: tb('mutation.successTitle'),
        message: successMessage || tb('mutation.successMessage'),
      });

      navigate(routes.bankCash.main);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        autoClose: 5000,
        title: tb('mutation.errorTitle'),
        message: error.message || tb('mutation.errorMessage'),
      });
    },
  });
};
