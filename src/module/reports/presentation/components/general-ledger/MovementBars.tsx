import React from 'react';
import { Group, Text, Tooltip } from '@mantine/core';
import type {
  MovementBucket,
  MovementGranularity,
} from '@/module/reports/domain/generalLedgerInsights';
import { displayDate, formatMoney } from '@/module/reports/domain/reportFormat';
import { useTranslation } from '@/i18n';
import classes from './GeneralLedger.module.css';

const MAX_BUCKETS = 45;

const labelOf = (key: string, granularity: MovementGranularity) =>
  granularity === 'month' ? `${key.slice(5, 7)}/${key.slice(0, 4)}` : displayDate(key);

interface MovementBarsProps {
  buckets: MovementBucket[];
  granularity: MovementGranularity;
}

/** Debit and credit of an account per day (or per month for a long period), as paired bars. */
export const MovementBars: React.FC<MovementBarsProps> = ({ buckets, granularity }) => {
  const { t } = useTranslation('reports');
  const shown = buckets.slice(-MAX_BUCKETS);
  const peak = Math.max(...shown.flatMap((bucket) => [bucket.debit, bucket.credit]), 1);

  return (
    <div>
      <div className={classes.bars} role="img" aria-label={t('generalLedger.chartMovementTitle')}>
        {shown.map((bucket) => (
          <Tooltip
            key={bucket.key}
            withArrow
            multiline
            label={`${labelOf(bucket.key, granularity)} · ${t('common.debit')} ${formatMoney(bucket.debit)} · ${t('common.creditId')} ${formatMoney(bucket.credit)}`}
          >
            <div className={classes.barGroup}>
              <div
                className={`${classes.bar} ${classes.barDebit}`}
                style={{
                  height: `${bucket.debit > 0 ? Math.max(2, (bucket.debit / peak) * 100) : 0}%`,
                }}
              />
              <div
                className={`${classes.bar} ${classes.barCredit}`}
                style={{
                  height: `${bucket.credit > 0 ? Math.max(2, (bucket.credit / peak) * 100) : 0}%`,
                }}
              />
            </div>
          </Tooltip>
        ))}
      </div>

      <Group justify="space-between" mt={6} wrap="nowrap">
        <Text fz="xs" c="dimmed">
          {labelOf(shown[0].key, granularity)}
        </Text>
        <Group gap="md" wrap="nowrap">
          <Group gap={6} wrap="nowrap">
            <span
              className={`${classes.bar} ${classes.barDebit}`}
              style={{ width: 10, height: 10, flex: 'none', borderRadius: 2 }}
            />
            <Text fz="xs" c="dimmed">
              {t('common.debit')}
            </Text>
          </Group>
          <Group gap={6} wrap="nowrap">
            <span
              className={`${classes.bar} ${classes.barCredit}`}
              style={{ width: 10, height: 10, flex: 'none', borderRadius: 2 }}
            />
            <Text fz="xs" c="dimmed">
              {t('common.creditId')}
            </Text>
          </Group>
        </Group>
        <Text fz="xs" c="dimmed">
          {labelOf(shown[shown.length - 1].key, granularity)}
        </Text>
      </Group>
    </div>
  );
};
