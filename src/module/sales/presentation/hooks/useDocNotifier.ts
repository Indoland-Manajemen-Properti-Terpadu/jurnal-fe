import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { useSaleErrorMessage } from './saleErrorMessage';

type DocNamespace = 'salesQuotes' | 'salesOrders';

/** Success, warning and failure messages of the actions on a sales document. */
export const useDocNotifier = (ns: DocNamespace) => {
  const { t } = useTranslation(ns);
  const { t: tSales } = useTranslation('sales');
  const describe = useSaleErrorMessage();
  return {
    success: (key: string, number?: string) =>
      notifications.show({ color: 'green', message: t(`notify.${key}`, { number: number ?? '' }) }),
    warning: (key: string, reason?: string) =>
      notifications.show({
        color: 'yellow',
        autoClose: 8000,
        message: t(`notify.${key}`, { reason: reason ?? '' }),
      }),
    failure: (error: unknown) =>
      notifications.show({
        color: 'orange',
        autoClose: 7000,
        title: tSales('notify.failedTitle'),
        message: describe(error),
      }),
  };
};
