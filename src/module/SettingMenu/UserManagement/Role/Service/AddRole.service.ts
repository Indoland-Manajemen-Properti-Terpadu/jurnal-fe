import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import { useNavigate } from 'react-router-dom';
import { API_ACCOUNT } from '@/services/endpoint';
import { post } from '@/lib/http/apiClient';
import { AddRolePayload } from '../Types/AddRolePayload';

export const useAddRole = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: AddRolePayload) => post(API_ACCOUNT.POST_ADD_ROLE, data),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        autoClose: 3000,
        title: 'Role Created Successfully!',
        message: `You can view the role in additional role list.`,
      });
      navigate(routes.userManagement.list);
    },
    onError: (error: Error) => {
      console.error('Error adding account:', error);
    },
  });
};
