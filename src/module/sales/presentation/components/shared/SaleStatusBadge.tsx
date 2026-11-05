import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { SaleDisplayStatus } from '@/module/sales/domain/sale';
import { saleStatusTone } from '@/module/sales/domain/saleStatus';

/** The payment state as the server reports it, worded in the active language. */
export const SaleStatusBadge = ({ status }: Readonly<{ status: SaleDisplayStatus }>) => {
  const { t } = useTranslation('sales');
  const tone = saleStatusTone(status.code);
  return (
    <Badge
      color={tone.color}
      variant={tone.variant}
      radius="sm"
      size="md"
      style={{ width: 'max-content', maxWidth: 'none' }}
    >
      {t(`status.${status.code.toLowerCase()}`)}
    </Badge>
  );
};
