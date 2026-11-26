import { Paper, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { PayablesAging } from '@/module/purchases/domain/purchaseDocuments';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import classes from './PayablesKpis.module.css';

/** The report's total and five age buckets, in prototype order. */
export const PayablesKpis = ({ data }: Readonly<{ data: PayablesAging }>) => {
  const { t } = useTranslation('purchases');
  const { totals, precision } = data;
  const cards = [
    {
      key: 'totalOwed',
      value: totals.totalRemaining,
      hint: t('reports.kpi.totalOwedHint', { count: totals.billCount }),
    },
    { key: 'current', value: totals.current },
    { key: 'days1to30', value: totals.days1to30 },
    { key: 'days31to60', value: totals.days31to60 },
    { key: 'days61to90', value: totals.days61to90 },
    { key: 'over90', value: totals.over90 },
  ] as const;

  return (
    <div className={classes.grid}>
      {cards.map((card) => (
        <Paper key={card.key} withBorder radius="md" p="md" className={classes.card}>
          <Text size="xs" c="dimmed">
            {t(`reports.kpi.${card.key}`)}
          </Text>
          <Text size="lg" fw={700} className={classes.amount}>
            {formatAmount(card.value, precision)}
          </Text>
          {'hint' in card && (
            <Text size="xs" c="dimmed">
              {card.hint}
            </Text>
          )}
        </Paper>
      ))}
    </div>
  );
};
