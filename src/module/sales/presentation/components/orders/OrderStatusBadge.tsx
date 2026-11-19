import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { OrderStatus } from '@/module/sales/domain/saleOrder';

const TONES: Record<OrderStatus, { color: string; variant: 'light' | 'outline' }> = {
  DRAFT: { color: 'gray', variant: 'light' },
  WAITING_CONFIRMATION: { color: 'primary', variant: 'light' },
  CONFIRMED: { color: 'green', variant: 'light' },
  COMPLETED: { color: 'green', variant: 'light' },
  CANCELLED: { color: 'gray', variant: 'outline' },
};

/** The state of an order, worded in the active language. */
export const OrderStatusBadge = ({ status }: Readonly<{ status: OrderStatus }>) => {
  const { t } = useTranslation('salesOrders');
  const tone = TONES[status];
  return (
    <Badge
      color={tone.color}
      variant={tone.variant}
      radius="sm"
      size="md"
      style={{ width: 'max-content', maxWidth: 'none' }}
    >
      {t(`status.${status.toLowerCase()}`)}
    </Badge>
  );
};
