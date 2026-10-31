import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import type { AddRolePayload } from '@/module/user-management/domain/rolePayload';
import { createRole } from '@/module/user-management/infrastructure/roleApi';

/** Not wired to the Add Role page yet; kept so the page can call it once the API contract is confirmed. */
export const useAddRole = () => {
  const navigate = useNavigate();
  const { t: tu } = useTranslation('userManagement');
  return useMutation({
    mutationFn: (data: AddRolePayload) => createRole(data),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        autoClose: 3000,
        title: tu('role.createdTitle'),
        message: tu('role.createdMessage'),
      });
      navigate(routes.userManagement.list);
    },
  });
};
