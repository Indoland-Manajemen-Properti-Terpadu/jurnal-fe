import { useMemo } from 'react';
import { Select } from '@mantine/core';
import { IconClipboardList } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import type { SaleOrder } from '@/module/sales/domain/saleOrder';
import { useOrder, useOrders } from '../../hooks/useOrderQueries';

interface OrderSourceSelectProps {
  /** The customer picked on this form; orders are listed only once there is one. */
  customerId: string;
  /** Id of the order the invoice is made from, if any. */
  value: string;
  onPick: (order: SaleOrder | null) => void;
}

/** "Ambil dari Pesanan": starts the invoice from a confirmed order of the chosen customer. */
export function OrderSourceSelect({ customerId, value, onPick }: Readonly<OrderSourceSelectProps>) {
  const { t } = useTranslation('sales');
  const query = useOrders(
    { tab: 'running', customer: customerId, limit: 100 },
    { enabled: Boolean(customerId) }
  );
  // The order this form already carries may not be in the list (or not yet loaded).
  const current = useOrder(value || undefined);
  const orders = useMemo(() => {
    const confirmed = (query.data?.items ?? []).filter((order) => order.status === 'CONFIRMED');
    if (current.data && !confirmed.some((order) => order.id === current.data?.id)) {
      confirmed.unshift(current.data);
    }
    return confirmed;
  }, [query.data, current.data]);

  return (
    <Select
      label={t('form.general.orderSource')}
      description={t('form.general.orderSourceHint')}
      inputWrapperOrder={['label', 'input', 'description', 'error']}
      placeholder={
        customerId
          ? t('form.general.orderSourcePlaceholder')
          : t('form.general.orderSourceNeedsCustomer')
      }
      leftSection={<IconClipboardList size={16} />}
      disabled={!customerId}
      clearable
      searchable
      nothingFoundMessage={t('form.general.orderSourceEmpty')}
      data={orders.map((order) => ({
        value: order.id,
        label: `${order.transactionNumber} · ${formatIDR(order.total)}`,
      }))}
      value={value || null}
      onChange={(id) => onPick(orders.find((order) => order.id === id) ?? null)}
    />
  );
}
