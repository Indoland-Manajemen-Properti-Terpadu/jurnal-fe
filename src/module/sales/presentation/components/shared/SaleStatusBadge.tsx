import { Badge, Group, Text } from '@mantine/core';
import { IconCornerUpLeft } from '@tabler/icons-react';
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

/**
 * Show the payment state as the primary badge and return extent beside it. A partial-payment
 * amount is already visible in the balance column, so it does not need a second badge.
 */
export const SaleStatusBadges = ({
  sale,
  align = 'center',
}: Readonly<{
  sale: Pick<
    Sale,
    'displayStatus' | 'hasReturn' | 'isPartiallyPaid' | 'items' | 'finalAmount' | 'returnedAmount'
  >;
  align?: 'center' | 'flex-start';
}>) => {
  const { t } = useTranslation('sales');
  const { main, returned } = saleBadges(sale);
  const tone = saleStatusTone(main);
  return (
    <Group gap={8} justify={align} wrap="nowrap">
      <Badge color={tone.color} variant={tone.variant} radius="sm" size="sm" style={BADGE_STYLE}>
        {t(main === 'PARTIAL' ? 'status.partialPaid' : `status.${main.toLowerCase()}`)}
      </Badge>
      {returned && (
        <Group gap={3} wrap="nowrap" c="orange.7">
          <IconCornerUpLeft size={14} aria-hidden="true" />
          <Text size="xs" fw={600} c="orange.7" style={{ whiteSpace: 'nowrap' }}>
            {t(
              returned === 'partial'
                ? 'status.returnedPartial'
                : returned === 'full'
                  ? 'status.returnedFull'
                  : 'status.returned'
            )}
          </Text>
        </Group>
      )}
    </Group>
  );
};
