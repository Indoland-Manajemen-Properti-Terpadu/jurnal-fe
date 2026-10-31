import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { routes } from '@/router/routes';
import { useNavigate } from 'react-router-dom';
import { updateAccount } from '../../infrastructure/accountApi';
import { AddAccountPayload } from '../../domain/addAccountPayload';

const NS = 'chartOfAccounts';

export const useUpdateAccount = (accountId: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddAccountPayload) => updateAccount(accountId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['detail_account', accountId] });
      notifications.show({
        color: 'green',
        autoClose: 3500,
        title: t('toast.updateOkTitle', undefined, NS),
        message: t('toast.updateOkMsg', undefined, NS),
      });
      navigate(routes.chartOfAccounts.main);
    },
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        autoClose: 5000,
        title: t('toast.updateFailTitle', undefined, NS),
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('toast.updateFailMsg', undefined, NS),
      });
    },
  });
};
