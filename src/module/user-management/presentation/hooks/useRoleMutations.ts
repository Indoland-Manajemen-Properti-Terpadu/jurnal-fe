import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import type { AccessRole } from '@/module/user-management/domain/accessRole';
import type { RolePayload } from '@/module/user-management/domain/rolePayload';
import { toUserManagementError } from '@/module/user-management/infrastructure/apiError';
import {
  createRole,
  deleteRole,
  updateRole,
} from '@/module/user-management/infrastructure/roleApi';
import { userManagementKeys } from './userManagementKeys';
import { useUserManagementNotifier } from './useUserManagementNotifier';

const useRefreshRoles = () => {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: userManagementKeys.rolesRoot }),
      client.invalidateQueries({ queryKey: userManagementKeys.auditRoot }),
      client.invalidateQueries({ queryKey: [...userManagementKeys.all, 'role'] }),
    ]);
};

export const useCreateRole = (onDone?: (role: AccessRole) => void) => {
  const { t } = useTranslation('userManagement');
  const notify = useUserManagementNotifier();
  const refresh = useRefreshRoles();

  return useMutation<AccessRole, unknown, RolePayload>({
    mutationFn: createRole,
    onSuccess: async (role) => {
      await refresh();
      notify.success(t('toast.roleCreated', { name: role.name }));
      onDone?.(role);
    },
    onError: (error) => notify.failure(toUserManagementError(error), 'role'),
  });
};

export const useUpdateRole = (id: string, onDone?: (role: AccessRole) => void) => {
  const { t } = useTranslation('userManagement');
  const notify = useUserManagementNotifier();
  const refresh = useRefreshRoles();

  return useMutation<AccessRole, unknown, RolePayload>({
    mutationFn: (payload) => updateRole(id, payload),
    onSuccess: async (role) => {
      await refresh();
      notify.success(t('toast.roleUpdated', { name: role.name }));
      onDone?.(role);
    },
    onError: (error) => notify.failure(toUserManagementError(error), 'role'),
  });
};

export const useDeleteRole = (onDone?: () => void) => {
  const { t } = useTranslation('userManagement');
  const notify = useUserManagementNotifier();
  const refresh = useRefreshRoles();

  return useMutation<void, unknown, AccessRole>({
    mutationFn: (role) => deleteRole(role.id),
    onSuccess: async (_data, role) => {
      await refresh();
      notify.success(t('toast.roleDeleted', { name: role.name }));
      onDone?.();
    },
    onError: (error) => notify.failure(toUserManagementError(error), 'role'),
  });
};
