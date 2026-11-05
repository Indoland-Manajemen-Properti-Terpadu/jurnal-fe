import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import type { SendNotice } from '@/module/sales/domain/saleNotices';
import { useSaleErrorMessage } from './saleErrorMessage';

/** Success, warning and failure messages of sales actions, in the active language. */
export const useSaleNotifier = () => {
  const { t } = useTranslation('sales');
  const describe = useSaleErrorMessage();
  return {
    success: (key: string, number?: string) =>
      notifications.show({ color: 'green', message: t(`notify.${key}`, { number: number ?? '' }) }),
    warning: (key: string) =>
      notifications.show({ color: 'yellow', autoClose: 8000, message: t(`notify.${key}`) }),
    notices: (notices: SendNotice[], number?: string) =>
      notices.forEach((notice) =>
        notice.level === 'success'
          ? notifications.show({
              color: 'green',
              message: t(`notify.${notice.key}`, { number: number ?? '' }),
            })
          : notifications.show({
              color: 'yellow',
              autoClose: 8000,
              message: t(`notify.${notice.key}`),
            })
      ),
    failure: (error: unknown) =>
      notifications.show({
        color: 'orange',
        autoClose: 7000,
        title: t('notify.failedTitle'),
        message: describe(error),
      }),
  };
};
