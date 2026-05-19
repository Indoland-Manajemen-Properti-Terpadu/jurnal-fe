import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import { useNavigate } from 'react-router-dom';
import { API_ACCOUNT } from '@/services/endpoint';
import { post } from '@/services/apiClient';
import { AddAccountPayload } from '../types/AddAccountPayload';

export const useAddAccount = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload: AddAccountPayload) => post(API_ACCOUNT.ADD_ACCOUNT, payload),
    onSuccess: () => {
      notifications.show({
        color: 'cyan',
        autoClose: 3000,
        title: 'Account Created Successfully!',
        message: `You can view the account in the journal list.`,
      });
      navigate(routes.generalJournal.main);
    },
    onError: (error: Error) => {
      console.error('Error adding account:', error);
    },
  });
};
