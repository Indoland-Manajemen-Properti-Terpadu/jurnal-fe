import { Group, Paper, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { reconciliationGap, type BalanceReport } from '@/module/inventory/domain/stockBalance';
import { dateFormatV1 } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';

/**
 * Whether the stock value agrees with the Inventory account of the general ledger, in one calm line.
 * A gap names both figures so the reader sees which side is higher.
 */
interface ReconciliationBannerProps {
  report: BalanceReport;
  /** True while the table below is narrowed to one warehouse or category. */
  scoped?: boolean;
}

export function ReconciliationBanner({
  report,
  scoped = false,
}: Readonly<ReconciliationBannerProps>) {
  const { t } = useTranslation('stockMovements');
  const gap = reconciliationGap(report);
  if (!report.reconciliation || gap === null) return null;
  const date = dateFormatV1(report.asOf, 'D MMM YYYY');
  const { matches, stockValue, ledgerValue } = report.reconciliation;
  const color = matches ? 'green' : 'orange';

  return (
    <Paper
      radius="md"
      px="md"
      py="sm"
      bg={`${color}.0`}
      style={{ border: `1px solid var(--mantine-color-${color}-2)` }}
    >
      <Group gap="sm" wrap="nowrap" align="center">
        <ThemeIcon size={28} radius="xl" variant="light" color={color}>
          {matches ? <IconCircleCheck size={16} /> : <IconAlertTriangle size={16} />}
        </ThemeIcon>
        <Text size="sm" c="dark.7" style={{ flex: 1 }}>
          <Text span fw={700} c={`${color}.9`}>
            {matches
              ? t('reconciliation.matches')
              : t('reconciliation.gap', { amount: formatCurrency(gap) })}
          </Text>
          {' · '}
          {t(matches ? 'reconciliation.matchesBody' : 'reconciliation.gapBody', { date })}
          {scoped ? ` ${t('reconciliation.wholeSite')}` : ''}
        </Text>
        {!matches && (
          <Tooltip
            withArrow
            multiline
            w={260}
            label={t('reconciliation.figures', {
              stock: formatCurrency(stockValue),
              ledger: formatCurrency(ledgerValue),
            })}
          >
            <Text size="xs" c="orange.9" fw={600} style={{ whiteSpace: 'nowrap', cursor: 'help' }}>
              {t('reconciliation.compare')}
            </Text>
          </Tooltip>
        )}
      </Group>
    </Paper>
  );
}
