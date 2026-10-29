import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import { useNavigate } from 'react-router-dom';
import { API_ACCOUNT } from '@/services/endpoint';
import { post } from '@/lib/http/apiClient';
import { AddAccountPayload } from '../types/AddAccountPayload';

export const useAddAccount = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddAccountPayload) => post(API_ACCOUNT.ADD_ACCOUNT, payload),
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
      console.error('Error adding account:', error);
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
