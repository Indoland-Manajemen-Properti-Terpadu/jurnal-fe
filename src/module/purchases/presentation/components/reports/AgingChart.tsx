import { Stack, Text } from '@mantine/core';
import { IconHourglass } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { bucketShares } from '@/module/purchases/domain/payablesView';
import type { PayablesAging } from '@/module/purchases/domain/purchaseDocuments';
import classes from '@/module/purchases/presentation/components/reports/AgingChart.module.css';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { AGING_COLOR } from '@/module/purchases/presentation/components/shared/visuals';

/** One bar per age bucket, filled to its share of everything still owed. */
export const AgingChart = ({ totals }: Readonly<{ totals: PayablesAging['totals'] }>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconHourglass}
      title={t('hub.overview.agingTitle')}
      subtitle={t('hub.overview.agingSubtitle')}
    >
      <Stack gap="sm">
        {bucketShares(totals).map((bucket) => (
          <div key={bucket.key} className={classes.row}>
            <Text fz="sm">{t(`reports.col.${bucket.key}`)}</Text>
            <div
              className={classes.track}
              role="img"
              aria-label={`${t(`reports.col.${bucket.key}`)} ${Math.round(bucket.share * 100)}%`}
            >
              <div
                className={classes.fill}
                style={{ width: `${bucket.share * 100}%`, background: AGING_COLOR[bucket.key] }}
              />
            </div>
            <Text fz="sm" fw={500} className={classes.amount}>
              {formatAmount(bucket.amount)}
            </Text>
          </div>
        ))}
      </Stack>
    </SectionCard>
  );
};
