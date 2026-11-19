import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { ReturnDisplayStatus } from '@/module/sales/domain/saleReturn';

const TONES: Record<ReturnDisplayStatus, { color: string; variant: 'light' | 'outline' }> = {
  DRAFT: { color: 'gray', variant: 'light' },
  ISSUED: { color: 'primary', variant: 'light' },
  COMPLETED: { color: 'green', variant: 'light' },
  VOID: { color: 'gray', variant: 'outline' },
};

/** Where a return stands, worded in the active language. */
export const ReturnStatusBadge = ({ status }: Readonly<{ status: ReturnDisplayStatus }>) => {
  const { t } = useTranslation('salesReturns');
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
