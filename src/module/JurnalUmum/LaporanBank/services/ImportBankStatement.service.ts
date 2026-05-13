// hooks/useBankStatement.ts
import { API_ACCOUNT } from '@/services/endpoint';
import { useMutation } from '@tanstack/react-query';
import { post } from '@/services/apiClient';
import { Data } from '../types/ImportBankStatement.model';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router';

export const getImportBankStatement = (idAccount: string) => {
  return useMutation({
    mutationFn: async (data: File) => {
      const formData = new FormData();
      formData.append('attachments', data);
      const resp = post(`${API_ACCOUNT.POST_IMPORT_BANK_STATEMENT}/${idAccount}`, formData);
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

export const getSubmitImportBankStatement = (idAccount: string) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: Data) => {
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
        navigate(`/jurnal-umum/detail-account-cb/${idAccount}`);
      }
    },
    onError: () => {
      notifications.show({
        color: 'cyan',
        title: 'Failed asdasd',
        message: 'Bank statement failed to import adasd.',
      });
      navigate(`/jurnal-umum/detail-account-cb/${idAccount}`);
    },
  });
};
