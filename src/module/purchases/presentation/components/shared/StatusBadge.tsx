import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  statusTone,
  type PurchaseStatus,
  type StatusTone,
} from '@/module/purchases/domain/purchaseStatus';

const COLORS: Record<StatusTone, string> = {
  neutral: 'gray',
  info: 'primary',
  warning: 'yellow',
  success: 'green',
  danger: 'red',
};

/** Color only carries real state: waiting, done or refused. Everything else stays neutral or brand. */
export const StatusBadge = ({ status }: Readonly<{ status: PurchaseStatus }>) => {
  const { t } = useTranslation('purchases');
  return (
    <Badge variant="light" radius="sm" color={COLORS[statusTone(status)]}>
      {t(`status.${status}`)}
    </Badge>
  );
};
