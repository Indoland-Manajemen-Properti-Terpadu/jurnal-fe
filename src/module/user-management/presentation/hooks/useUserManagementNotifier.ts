import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import type { UserManagementError } from '@/module/user-management/infrastructure/apiError';

/** Success and failure toasts; failure text is a sentence the person can act on, never a status code. */
export const useUserManagementNotifier = () => {
  const { t } = useTranslation('userManagement');

  const errorMessage = (error: UserManagementError, context: 'user' | 'role'): string => {
    switch (error.kind) {
      case 'forbidden':
        return t(`error.forbidden.${context}`);
      case 'notFound':
        return t('error.notFound');
      case 'conflict':
        return t('error.conflict.role');
      case 'duplicateEmail':
        return t('error.duplicateEmail');
      case 'network':
        return t('error.network');
      case 'invalid':
        return t(`error.invalid.${context}`);
      default:
        return t('error.unknown');
    }
  };

  return {
    errorMessage,
    success: (message: string) =>
      notifications.show({ color: 'teal', title: t('toast.savedTitle'), message, autoClose: 4000 }),
    failure: (error: UserManagementError, context: 'user' | 'role') =>
      notifications.show({
        color: 'red',
        title: t('toast.failedTitle'),
        message: errorMessage(error, context),
        autoClose: 6000,
      }),
  };
};
