import { Group, Progress, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { paidPercent } from '@/module/sales/domain/saleReceivables';
import type { Sale } from '@/module/sales/domain/sale';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';

/** How much of this invoice has been paid; one bar and one sentence. */
export function PaymentProgress({ sale, display }: Readonly<{ sale: Sale; display: SaleDisplay }>) {
  const { t } = useTranslation('sales');
  const percent = paidPercent(sale.finalAmount, sale.paidAmount);

  return (
    <Stack gap={6}>
      <Group justify="space-between" wrap="wrap" gap="xs">
        <Text size="sm" fw={600}>
          {t('view.progressTitle')}
        </Text>
        <Text size="xs" c="dimmed">
          {t('view.progressPercent', { percent })}
        </Text>
      </Group>
      <Progress
        value={percent}
        color="primary"
        size="md"
        radius="xl"
        aria-label={t('view.progressAria')}
      />
      <Text size="xs" c="dimmed">
        {t('view.progressReceived', { amount: display.money(sale.paidAmount) })}{' '}
        {t('view.progressOf', { total: display.money(sale.finalAmount) })}
      </Text>
    </Stack>
  );
}
