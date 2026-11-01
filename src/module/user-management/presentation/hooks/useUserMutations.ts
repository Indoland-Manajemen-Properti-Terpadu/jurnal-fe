import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import type {
  CreateUserInput,
  ManagedUser,
  UpdateUserInput,
} from '@/module/user-management/domain/userTypes';
import { toUserManagementError } from '@/module/user-management/infrastructure/apiError';
import { createUser, updateUser } from '@/module/user-management/infrastructure/userApi';
import { userManagementKeys } from './userManagementKeys';
import { useUserManagementNotifier } from './useUserManagementNotifier';

/** Create and update refresh the lists and the history, which records the change. */
const useRefreshUsers = () => {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: userManagementKeys.usersRoot }),
      client.invalidateQueries({ queryKey: userManagementKeys.auditRoot }),
    ]);
};

export const useCreateUser = (onDone?: (user: ManagedUser) => void) => {
  const { t } = useTranslation('userManagement');
  const notify = useUserManagementNotifier();
  const refresh = useRefreshUsers();

  return useMutation<ManagedUser, unknown, CreateUserInput>({
    mutationFn: createUser,
    onSuccess: async (user) => {
      await refresh();
      notify.success(t('toast.userCreated', { name: user.name }));
      onDone?.(user);
    },
    onError: (error) => notify.failure(toUserManagementError(error), 'user'),
  });
};

export const useUpdateUser = (id: string, onDone?: (user: ManagedUser) => void) => {
  const { t } = useTranslation('userManagement');
  const notify = useUserManagementNotifier();
  const refresh = useRefreshUsers();

  return useMutation<ManagedUser, unknown, UpdateUserInput>({
    mutationFn: (input) => updateUser(id, input),
    onSuccess: async (user) => {
      await refresh();
      notify.success(t('toast.userUpdated', { name: user.name }));
      onDone?.(user);
    },
    onError: (error) => notify.failure(toUserManagementError(error), 'user'),
  });
};

/** Switch a user on or off from the list. */
export const useSetUserActive = (onDone?: () => void) => {
  const { t } = useTranslation('userManagement');
  const notify = useUserManagementNotifier();
  const refresh = useRefreshUsers();

  return useMutation<ManagedUser, unknown, { user: ManagedUser; isActive: boolean }>({
    mutationFn: ({ user, isActive }) => updateUser(user.id, { isActive }),
    onSuccess: async (user) => {
      await refresh();
      notify.success(t('toast.userUpdated', { name: user.name }));
      onDone?.();
    },
    onError: (error) => notify.failure(toUserManagementError(error), 'user'),
  });
};
