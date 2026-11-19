import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import type { BulkRecurringValues } from '../../domain/saleBulk';
import { createBulkRecurring } from '../../infrastructure/saleBulkApi';
import { useSaleErrorMessage } from './saleErrorMessage';
import { saleKeys } from './useSaleQueries';

/** Makes the drafts and refreshes the invoice lists, which now hold new rows. */
export const useBulkRecurring = () => {
  const queryClient = useQueryClient();
  const { t: tSales } = useTranslation('sales');
  const describe = useSaleErrorMessage();
  return useMutation({
    mutationFn: (values: BulkRecurringValues) => createBulkRecurring(values),
    onError: (error) =>
      notifications.show({
        color: 'orange',
        autoClose: 7000,
        title: tSales('notify.failedTitle'),
        message: describe(error),
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: saleKeys.all }),
  });
};
