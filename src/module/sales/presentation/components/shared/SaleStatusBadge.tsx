import { Badge, Group } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { Sale, SaleDisplayStatus } from '@/module/sales/domain/sale';
import { saleBadges, saleStatusTone } from '@/module/sales/domain/saleStatus';

const BADGE_STYLE = { width: 'max-content', maxWidth: 'none' } as const;

/** The payment state as the server reports it, worded in the active language. */
export const SaleStatusBadge = ({ status }: Readonly<{ status: SaleDisplayStatus }>) => {
  const { t } = useTranslation('sales');
  const tone = saleStatusTone(status.code);
  return (
    <Badge color={tone.color} variant={tone.variant} radius="sm" size="md" style={BADGE_STYLE}>
      {t(`status.${status.code.toLowerCase()}`)}
    </Badge>
  );
};

const STATUS_KEY = { RETURNED: 'status.returned', PARTIAL: 'status.partialPaid' } as const;

/**
 * The badges of a whole invoice: "Diretur" instead of the state once it has a return, and a
 * second "Dibayar sebagian" while a payment covers only part of it.
 */
export const SaleStatusBadges = ({
  sale,
  align = 'center',
}: Readonly<{
  sale: Pick<Sale, 'displayStatus' | 'hasReturn' | 'isPartiallyPaid'>;
  align?: 'center' | 'flex-start';
}>) => {
  const { t } = useTranslation('sales');
  const { main, partialPaid } = saleBadges(sale);
  const tone = saleStatusTone(main);
  return (
    <Group gap={6} justify={align} wrap="wrap">
      <Badge color={tone.color} variant={tone.variant} radius="sm" size="md" style={BADGE_STYLE}>
        {t(
          main === 'RETURNED' || main === 'PARTIAL'
            ? STATUS_KEY[main]
            : `status.${main.toLowerCase()}`
        )}
      </Badge>
      {partialPaid && (
        <Badge color="blue" variant="outline" radius="sm" size="md" style={BADGE_STYLE}>
          {t('status.partialPaid')}
        </Badge>
      )}
    </Group>
  );
};
