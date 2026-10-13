// hooks/useBankStatement.ts
import { API_ACCOUNT } from '@/services/endpoint';
import { useMutation } from '@tanstack/react-query';
import { post } from '@/services/apiClient';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';

export const getImportBankStatement = (idAccount: string) => {
  return useMutation({
    mutationFn: async (data: File) => {
      const formData = new FormData();
      formData.append('accountId', idAccount);
      formData.append('file', data);
      const resp = post(API_ACCOUNT.POST_IMPORT_BANK_STATEMENT, formData);
      return resp;
    },
    onSuccess: (data) => {
      localStorage.removeItem('bankStatementData');
      localStorage.setItem('bankStatementData', JSON.stringify(data));
    },
    onError: (error: Error) => {
      console.error('Error adding account:', error);
    },
  });
};

export const getConfirmImportBankStatement = (idAccount: string) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: any) => {
      const resp = await post(API_ACCOUNT.POST_CONFIRM_IMPORT_BANK_STATEMENT, data);
      return resp;
    },
    onSuccess: (resp) => {
      if (resp.status === 400 || resp.code === 400) {
        notifications.show({
          color: 'red',
          title: 'Import Gagal',
          message:
            resp.message || resp.data?.message || 'Terjadi kesalahan saat mengonfirmasi import.',
        });
      } else {
        notifications.show({
          color: 'green',
          title: 'Berhasil',
          message: 'Bank statement telah berhasil di-import.',
        });
        navigate(`/general-journal/detail-account-cb/${idAccount}`);
      }
    },
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: error?.response?.data?.message || 'Terjadi kesalahan pada server.',
      });
    },
  });
};

export const getSubmitImportBankStatement = (idAccount: string) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      console.log(data);
      const resp = post(`${API_ACCOUNT.POST_COMMIT_IMPORT_BANK_STATEMENT}/${idAccount}`, data);
      return resp;
    },
    onSuccess: (resp) => {
      if (resp.status === 400) {
        notifications.show({
          color: 'red',
          title: 'Bank statement failed to import.',
          message: resp.data.message,
        });
        return;
      } else {
        notifications.show({
          color: 'green',
          title: 'Success',
          message: 'Bank statement has been successfully imported.',
        });
        navigate(`/general-journal/detail-account-cb/${idAccount}`);
      }
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Failed asdasd',
        message: 'Bank statement failed to import adasd.',
      });
      navigate(`/general-journal/detail-account-cb/${idAccount}`);
    },
  });
};
