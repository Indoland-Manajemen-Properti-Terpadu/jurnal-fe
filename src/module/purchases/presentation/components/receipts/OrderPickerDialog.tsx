import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { orderActions } from '@/module/purchases/domain/purchaseActions';
import {
  SourcePickerDialog,
  type SourceOption,
} from '@/module/purchases/presentation/components/shared/SourcePickerDialog';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';
import { useOrders } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface OrderPickerDialogProps {
  opened: boolean;
  onClose: () => void;
  onPick: (orderId: string) => void;
}

/** The sent order a receipt records goods or work against, with how much is still to come. */
export const OrderPickerDialog = ({
  opened,
  onClose,
  onPick,
}: Readonly<OrderPickerDialogProps>) => {
  const { t } = useTranslation('purchases');
  const [search, setSearch] = useState('');
  const query = useOrders({ status: ['SENT', 'PARTIAL_RECEIVED'], search, limit: 20 }, opened);
  const options: SourceOption[] = (query.data?.items ?? [])
    .filter((order) => orderActions(order).receive)
    .map((order) => {
      const open = order.items
        .filter((item) => !item.billOnly)
        .reduce((sum, item) => sum + Math.max(0, item.quantity - item.receivedQty), 0);
      return {
        id: order.id,
        number: order.number,
        line: order.vendor.name,
        sub: t('receipts.picker.remaining', { count: formatQuantity(open) }),
        trailing: formatAmount(order.finalAmount),
      };
    });

  return (
    <SourcePickerDialog
      opened={opened}
      onClose={onClose}
      title={t('receipts.picker.title')}
      description={t('receipts.picker.description')}
      searchPlaceholder={t('receipts.picker.search')}
      emptyText={t('receipts.picker.empty')}
      options={options}
      isLoading={query.isLoading}
      isError={query.isError}
      onSearch={setSearch}
      onPick={onPick}
    />
  );
};
