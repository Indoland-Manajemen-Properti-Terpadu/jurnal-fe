import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import { useNavigate } from 'react-router-dom';
import { API_ACCOUNT } from '@/services/endpoint';
import { patch } from '@/services/apiClient';
import { AddAccountPayload } from '../types/AddAccountPayload';

export const useUpdateAccount = (accountId: string) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload: AddAccountPayload) =>
      patch(`${API_ACCOUNT.ADD_ACCOUNT}/${accountId}`, payload),
    onSuccess: () => {
      notifications.show({
        color: 'cyan',
        autoClose: 3000,
        title: 'Account Updated Successfully!',
        message: `Account details have been updated.`,
      });
      navigate(routes.generalJournal.main);
    },
    onError: (error: any) => {
      console.error('Error updating account:', error);
      notifications.show({
        color: 'red',
        autoClose: 5000,
        title: 'Update Failed',
        message:
          error?.response?.data?.message || 'Something went wrong while updating the account.',
      });
    },
  });
};
