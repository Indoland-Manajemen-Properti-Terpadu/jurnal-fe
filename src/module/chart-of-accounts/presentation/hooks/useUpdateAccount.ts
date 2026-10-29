import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import { useNavigate } from 'react-router-dom';
import { updateAccount } from '../../infrastructure/accountApi';
import { AddAccountPayload } from '../../domain/addAccountPayload';

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
        title: 'Perubahan Akun Berhasil Disimpan',
        message: 'Informasi akun jurnal telah berhasil diperbarui dalam Chart of Accounts.',
      });
      navigate(routes.generalJournal.main);
    },
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        autoClose: 5000,
        title: 'Gagal Memperbarui Akun',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Terjadi kesalahan sistem saat memperbarui akun.',
      });
    },
  });
};
