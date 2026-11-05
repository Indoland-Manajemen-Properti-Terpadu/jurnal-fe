import React from 'react';
import { Group, Text } from '@mantine/core';
import { formatMoney } from '@/module/reports/domain/reportFormat';
import { percentOf } from '@/module/reports/domain/generalLedgerInsights';
import { useTranslation } from '@/i18n';
import classes from './GeneralLedger.module.css';

interface DebitCreditBarsProps {
  debit: number;
  credit: number;
}

/** Two bars on the same scale: when debit and credit are equal, so are the bars. */
export const DebitCreditBars: React.FC<DebitCreditBarsProps> = ({ debit, credit }) => {
  const { t } = useTranslation('reports');
  const peak = Math.max(debit, credit);
  const rows = [
    {
      key: 'debit',
      label: t('common.debit'),
      value: debit,
      tone: 'var(--mantine-color-primary-6)',
    },
    {
      key: 'credit',
      label: t('common.creditId'),
      value: credit,
      tone: 'var(--mantine-color-primary-3)',
    },
  ];

  return (
    <div>
      {rows.map((row) => (
        <Group key={row.key} gap="sm" wrap="nowrap" mb={6}>
          <Text fz="xs" fw={600} c="dimmed" w={48}>
            {row.label}
          </Text>
          <div className={classes.track} style={{ flex: 1 }}>
            <div
              className={classes.fill}
              style={{ width: `${percentOf(row.value, peak)}%`, background: row.tone }}
            />
          </div>
          <Text
            fz="xs"
            fw={600}
            c="dark.8"
            w={130}
            ta="right"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatMoney(row.value)}
          </Text>
        </Group>
      ))}
    </div>
  );
};
