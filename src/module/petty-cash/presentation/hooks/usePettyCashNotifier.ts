import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { usePettyCashErrorMessage } from '@/module/petty-cash/presentation/hooks/pettyCashErrorMessage';

/** Success and failure messages of petty cash actions, in the active language. */
export const usePettyCashNotifier = () => {
  const { t } = useTranslation('pettyCash');
  const describe = usePettyCashErrorMessage();
  return {
    success: (key: string, params?: Record<string, string | number>) =>
      notifications.show({ color: 'teal', message: t(`notify.${key}`, params) }),
    failure: (error: unknown) =>
      notifications.show({
        color: 'orange',
        autoClose: 7000,
        title: t('notify.failedTitle'),
        message: describe(error),
      }),
  };
};
