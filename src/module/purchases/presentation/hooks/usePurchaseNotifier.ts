import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { usePurchaseErrorMessage } from '@/module/purchases/presentation/hooks/purchaseErrorMessage';

/** Success and failure messages of purchasing actions, in the active language. */
export const usePurchaseNotifier = () => {
  const { t } = useTranslation('purchases');
  const describe = usePurchaseErrorMessage();
  return {
    success: (key: string, number?: string) =>
      notifications.show({
        color: 'green',
        message: `${t(`notify.${key}`)}${number ? ` (${number})` : ''}`,
      }),
    failure: (error: unknown) =>
      notifications.show({
        color: 'orange',
        autoClose: 7000,
        title: t('notify.failedTitle'),
        message: describe(error),
      }),
  };
};
