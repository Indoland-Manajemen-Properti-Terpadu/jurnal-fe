import type { ReactNode } from 'react';
import { Progress, RingProgress, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { percentOf, type ProductSummary } from '@/module/products/domain/productRules';
import classes from './ProductStatsCards.module.css';

type StatCardProps = { label: string; value: string; hint: string; visual: ReactNode };

const StatCard = ({ label, value, hint, visual }: Readonly<StatCardProps>) => (
  <div className={classes.card}>
    <div className={classes.text}>
      <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={500}>
        {label}
      </Text>
      <Text className={classes.value} fz={26} fw={700} c="dark.9" mt={4}>
        {value}
      </Text>
      <Text fz="var(--jurnal-text-xs)" c="dimmed" mt={6}>
        {hint}
      </Text>
    </div>
    <div className={classes.visual}>{visual}</div>
  </div>
);

type ProductStatsCardsProps = {
  summary: ProductSummary;
  categories: number;
  units: number;
};

/** Four cards: each one pairs a number with a small picture of the same data. */
export function ProductStatsCards({
  summary,
  categories,
  units,
}: Readonly<ProductStatsCardsProps>) {
  const { t } = useTranslation('products');
  const format = (value: number) => value.toLocaleString('id-ID');
  const peak = Math.max(...summary.categoryCounts, 0);
  const soldPercent = percentOf(summary.sold, summary.total);
  const boughtPercent = percentOf(summary.bought, summary.total);
  const untracked = Math.max(summary.total - summary.tracked, 0);

  return (
    <div className={classes.grid}>
      <StatCard
        label={t('stats.total')}
        value={format(summary.total)}
        hint={t('stats.totalHint', { categories: format(categories), units: format(units) })}
        visual={
          <div
            className={classes.bars}
            role="img"
            aria-label={t('stats.categoryChart', {
              counts: summary.categoryCounts.join(', '),
            })}
          >
            {summary.categoryCounts.map((count, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={classes.bar}
                data-peak={peak > 0 && count === peak}
                style={{ height: `${peak > 0 ? Math.max((count / peak) * 100, 7) : 7}%` }}
              />
            ))}
          </div>
        }
      />

      <StatCard
        label={t('stats.sold')}
        value={format(summary.sold)}
        hint={t('stats.soldHint')}
        visual={
          <RingProgress
            size={64}
            thickness={7}
            roundCaps
            sections={[{ value: soldPercent, color: 'primary.6' }]}
            rootColor="var(--mantine-color-primary-1)"
            label={
              <Text ta="center" className={classes.percent}>
                {soldPercent}%
              </Text>
            }
            aria-label={`${t('stats.sold')} ${soldPercent}%`}
          />
        }
      />

      <StatCard
        label={t('stats.bought')}
        value={format(summary.bought)}
        hint={t('stats.boughtHint')}
        visual={
          <>
            <Text className={classes.percent}>{boughtPercent}%</Text>
            <Progress
              value={boughtPercent}
              size="sm"
              radius="xl"
              color="primary.6"
              w="100%"
              aria-label={`${t('stats.bought')} ${boughtPercent}%`}
            />
          </>
        }
      />

      <StatCard
        label={t('stats.tracked')}
        value={format(summary.tracked)}
        hint={t('stats.trackedHint')}
        visual={
          <>
            <div className={classes.track} aria-hidden>
              <span
                className={classes.segment}
                data-tone="main"
                style={{ flex: summary.total ? summary.tracked : 1 }}
              />
              <span
                className={classes.segment}
                data-tone="soft"
                style={{ flex: summary.total ? untracked : 1 }}
              />
            </div>
            <div className={classes.legend}>
              <span className={classes.legendRow}>
                <span className={classes.legendDot} data-tone="main" />
                {t('stats.legendTracked')}
                <b>{format(summary.tracked)}</b>
              </span>
              <span className={classes.legendRow}>
                <span className={classes.legendDot} data-tone="soft" />
                {t('stats.legendUntracked')}
                <b>{format(untracked)}</b>
              </span>
            </div>
          </>
        }
      />
    </div>
  );
}
