import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import { useNavigate } from 'react-router-dom';
import { createAccount } from '../../infrastructure/accountApi';
import { AddAccountPayload } from '../../domain/addAccountPayload';

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
        title: 'Akun Berhasil Ditambahkan',
        message: 'Akun baru telah tersimpan dan dapat digunakan dalam jurnal dan transaksi.',
      });
      navigate(routes.generalJournal.main);
    },
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        autoClose: 5000,
        title: 'Gagal Menambahkan Akun',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Terjadi kesalahan pada sistem saat menyimpan akun.',
      });
    },
  });
};
