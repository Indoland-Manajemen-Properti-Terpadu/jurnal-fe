import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  statusTone,
  type PurchaseStatus,
  type StatusTone,
} from '@/module/purchases/domain/purchaseStatus';

const COLORS: Record<StatusTone, string> = {
  neutral: 'gray',
  info: 'blue',
  warning: 'orange',
  success: 'green',
  danger: 'red',
  cyan: 'cyan',
  slate: 'slate',
  purple: 'purple',
};

interface StatusBadgeProps {
  status: PurchaseStatus;
  /** The service's own Indonesian label; Indonesian readers see it as written. */
  label?: string;
  /** Context-specific English text when one status code has different meanings by document kind. */
  englishLabel?: string;
}

/** Use the backend's Indonesian status label to distinguish states that share an API code. */
export const StatusBadge = ({ status, label, englishLabel }: Readonly<StatusBadgeProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <Badge variant="light" radius="sm" color={COLORS[statusTone(status, label)]}>
      {currentLanguage === 'id' && label ? label : (englishLabel ?? t(`status.${status}`))}
    </Badge>
  );
};
