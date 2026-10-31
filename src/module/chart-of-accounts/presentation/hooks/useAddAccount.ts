import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { routes } from '@/router/routes';
import { useNavigate } from 'react-router-dom';
import { createAccount } from '../../infrastructure/accountApi';
import { AddAccountPayload } from '../../domain/addAccountPayload';

const NS = 'chartOfAccounts';

export const useAddAccount = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddAccountPayload) => createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      notifications.show({
        color: 'green',
        autoClose: 3500,
        title: t('toast.addOkTitle', undefined, NS),
        message: t('toast.addOkMsg', undefined, NS),
      });
      navigate(routes.chartOfAccounts.main);
    },
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        autoClose: 5000,
        title: t('toast.addFailTitle', undefined, NS),
        message:
          error?.response?.data?.message || error?.message || t('toast.addFailMsg', undefined, NS),
      });
    },
  });
};
