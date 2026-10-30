import { Divider, Grid, Paper, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatIDR } from '../../domain/saleFormat';
import type { SaleTotals } from '../../domain/saleTotals';

export function CreateSaleSummary({ totals }: Readonly<{ totals: SaleTotals }>) {
  const { t } = useTranslation('sales');

  return (
    <Paper withBorder p="md" radius="md" mt="md" bg="gray.0">
      <Grid gutter="xs">
        <Grid.Col span={6}>
          <Text size="xs" c="dimmed">
            {t('create.summarySubtotal')}
          </Text>
          <Text size="sm" fw={600} c="dark.8">
            {formatIDR(totals.subtotal)}
          </Text>
        </Grid.Col>
        <Grid.Col span={6} ta="right">
          <Text size="xs" c="dimmed">
            {t('create.summaryTax')}
          </Text>
          <Text size="sm" fw={600} c="dark.8">
            +{formatIDR(totals.taxTotal)}
          </Text>
        </Grid.Col>
        {totals.discountAmount > 0 && (
          <Grid.Col span={6}>
            <Text size="xs" c="dimmed">
              {t('create.summaryDiscount')}
            </Text>
            <Text size="sm" fw={600} c="red.7">
              -{formatIDR(totals.discountAmount)}
            </Text>
          </Grid.Col>
        )}
        {totals.withholdingAmount > 0 && (
          <Grid.Col span={6} ta="right">
            <Text size="xs" c="dimmed">
              {t('create.summaryWithholding')}
            </Text>
            <Text size="sm" fw={600} c="red.7">
              -{formatIDR(totals.withholdingAmount)}
            </Text>
          </Grid.Col>
        )}
        <Grid.Col span={12}>
          <Divider my={4} />
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="sm" fw={800} c="primary.9">
            {t('create.summaryFinal')}
          </Text>
        </Grid.Col>
        <Grid.Col span={6} ta="right">
          <Text size="md" fw={800} c="primary.9">
            {formatIDR(totals.finalAmount)}
          </Text>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
