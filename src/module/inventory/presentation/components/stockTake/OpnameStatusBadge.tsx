import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { OpnameStatus } from '@/module/inventory/domain/stockOpname';

const COLORS: Record<OpnameStatus, string> = {
  draft: 'gray',
  counting: 'blue',
  pending_approval: 'orange',
  posted: 'green',
  cancelled: 'gray',
};

/** The one place a count's status is drawn as a badge; a status is what a badge is for. */
export function OpnameStatusBadge({ status }: Readonly<{ status: OpnameStatus }>) {
  const { t } = useTranslation('stockTake');
  return (
    <Badge variant="light" color={COLORS[status]} size="sm">
      {t(`status.${status}`)}
    </Badge>
  );
}
