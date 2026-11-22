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

interface StatusBadgeProps {
  status: PurchaseStatus;
  /** The service's own Indonesian label; Indonesian readers see it as written. */
  label?: string;
}

/** Color only carries real state: waiting, done or refused. Everything else stays neutral or brand. */
export const StatusBadge = ({ status, label }: Readonly<StatusBadgeProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <Badge variant="light" radius="sm" color={COLORS[statusTone(status)]}>
      {currentLanguage === 'id' && label ? label : t(`status.${status}`)}
    </Badge>
  );
};
