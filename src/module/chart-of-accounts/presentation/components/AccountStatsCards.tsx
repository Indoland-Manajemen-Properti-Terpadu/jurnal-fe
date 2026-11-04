import React from 'react';
import { Progress, RingProgress, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { percentOf, type AccountStats } from '../../domain/accountStats';
import classes from './AccountStatsCards.module.css';

interface AccountStatsCardsProps {
  stats: AccountStats;
}

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  visual: React.ReactNode;
}

const StatCard = ({ label, value, hint, visual }: StatCardProps) => (
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

/** Four cards: each one pairs a number with a small picture of the same data. */
export const AccountStatsCards: React.FC<AccountStatsCardsProps> = ({ stats }) => {
  const { t } = useTranslation('chartOfAccounts');
  const format = (value: number) => value.toLocaleString('id-ID');

  const peak = Math.max(...stats.classCounts, 0);
  const cashPercent = percentOf(stats.bankCash, stats.total);
  const lockedPercent = percentOf(stats.locked, stats.total);
  const statementTotal = stats.balanceSheetCount + stats.profitLossCount;

  return (
    <div className={classes.grid}>
      <StatCard
        label={t('list.stats.totalTitle')}
        value={format(stats.total)}
        hint={t('list.stats.totalHint', {
          parents: format(stats.parentCount),
          subs: format(stats.subCount),
        })}
        visual={
          <div
            className={classes.bars}
            role="img"
            aria-label={t('list.stats.classChart', {
              counts: stats.classCounts.map((count, i) => `${i + 1}: ${count}`).join(', '),
            })}
          >
            {stats.classCounts.map((count, index) => (
              <span
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
        label={t('list.stats.cashTitle')}
        value={format(stats.bankCash)}
        hint={t('list.stats.cashHint')}
        visual={
          <RingProgress
            size={64}
            thickness={7}
            roundCaps
            sections={[{ value: cashPercent, color: 'primary.6' }]}
            rootColor="var(--mantine-color-primary-1)"
            label={
              <Text ta="center" className={classes.percent}>
                {cashPercent}%
              </Text>
            }
            aria-label={`${t('list.stats.cashTitle')} ${cashPercent}%`}
          />
        }
      />

      <StatCard
        label={t('list.stats.categoriesTitle')}
        value={format(stats.categoriesCount)}
        hint={t('list.stats.categoriesHint', { total: format(stats.total) })}
        visual={
          <>
            <div className={classes.track} aria-hidden>
              <span
                className={classes.segment}
                data-tone="main"
                style={{ flex: statementTotal ? stats.balanceSheetCount : 1 }}
              />
              <span
                className={classes.segment}
                data-tone="soft"
                style={{ flex: statementTotal ? stats.profitLossCount : 1 }}
              />
            </div>
            <div className={classes.legend}>
              <span className={classes.legendRow}>
                <span className={classes.legendDot} data-tone="main" />
                {t('list.stats.balanceSheetShort')}
                <b>{format(stats.balanceSheetCount)}</b>
              </span>
              <span className={classes.legendRow}>
                <span className={classes.legendDot} data-tone="soft" />
                {t('list.stats.profitLossShort')}
                <b>{format(stats.profitLossCount)}</b>
              </span>
            </div>
          </>
        }
      />

      <StatCard
        label={t('list.stats.lockedTitle')}
        value={format(stats.locked)}
        hint={t('list.stats.lockedHint')}
        visual={
          <>
            <Text className={classes.percent}>{lockedPercent}%</Text>
            <Progress
              value={lockedPercent}
              size="sm"
              radius="xl"
              color="primary.6"
              w="100%"
              aria-label={`${t('list.stats.lockedTitle')} ${lockedPercent}%`}
            />
          </>
        }
      />
    </div>
  );
};
