import { ActionIcon, Box, Button, Group, Text, Title, Tooltip } from '@mantine/core';
import { IconLock, IconLockOpen, IconNotebook, IconRefresh, IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from './dashboard.module.css';
import { formatCompact, formatIDR } from './dashboardFormat';

type HeroMetric = {
  key: string;
  label: string;
  value: number;
  color: string;
  share?: number;
};

interface DashboardHeroProps {
  greeting: string;
  userName: string;
  periodLabel: string;
  isPeriodLocked: boolean;
  isBalanced: boolean;
  hasData: boolean;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  liabilityRatio: number;
  equityRatio: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenPeriod: () => void;
  onOpenBalanceSheet: () => void;
  onCreateJournal: () => void;
}

const COLORS = {
  assets: '#7dd3fc',
  liabilities: '#fcd34d',
  equity: '#6ee7b7',
};

const clampPct = (n: number) => Math.min(100, Math.max(0, n));

export function DashboardHero({
  greeting,
  userName,
  periodLabel,
  isPeriodLocked,
  isBalanced,
  hasData,
  totalAssets,
  totalLiabilities,
  totalEquity,
  liabilityRatio,
  equityRatio,
  isRefreshing,
  onRefresh,
  onOpenPeriod,
  onOpenBalanceSheet,
  onCreateJournal,
}: DashboardHeroProps) {
  const { t } = useTranslation('dashboard');

  const metrics: HeroMetric[] = [
    { key: 'assets', label: t('totalAssets'), value: totalAssets, color: COLORS.assets },
    {
      key: 'liabilities',
      label: t('totalLiabilities'),
      value: totalLiabilities,
      color: COLORS.liabilities,
      share: liabilityRatio,
    },
    {
      key: 'equity',
      label: t('totalEquity'),
      value: totalEquity,
      color: COLORS.equity,
      share: equityRatio,
    },
  ];

  const liabPct = clampPct(liabilityRatio);
  const eqPct = clampPct(Math.min(equityRatio, 100 - liabPct));
  const PeriodIcon = isPeriodLocked ? IconLock : IconLockOpen;

  return (
    <Box component="section" className={`${classes.hero} ${classes.reveal}`}>
      {/* Header: context, greeting, actions */}
      <Box className={classes.heroHeader}>
        <Box style={{ minWidth: 0 }}>
          <Group gap={10} wrap="wrap" mb={12}>
            <button type="button" className={classes.heroMeta} onClick={onOpenPeriod}>
              <PeriodIcon size={13} stroke={2} />
              <span>{periodLabel}</span>
            </button>
            <span className={classes.heroMeta} data-static>
              <span
                className={classes.heroDot}
                style={{ backgroundColor: isBalanced ? COLORS.equity : COLORS.liabilities }}
              />
              <span>{isBalanced ? t('equationBalanced') : t('equationUnbalanced')}</span>
            </span>
          </Group>

          <Title order={1} className={classes.heroTitle}>
            {greeting}, {userName}
          </Title>
          <Text className={classes.heroSubtitle}>{t('heroSubtitle')}</Text>
        </Box>

        <Group gap={8} wrap="nowrap" className={classes.heroActions}>
          <Tooltip label={t('btnRefresh')} withArrow>
            <ActionIcon
              size={36}
              radius="md"
              className={classes.heroGhost}
              loading={isRefreshing}
              aria-label={t('btnRefresh')}
              onClick={onRefresh}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Button
            h={36}
            radius="md"
            className={classes.heroGhost}
            leftSection={<IconScale size={16} />}
            onClick={onOpenBalanceSheet}
          >
            {t('btnViewBalanceSheet')}
          </Button>
          <Button
            h={36}
            radius="md"
            variant="white"
            color="primary"
            fw={700}
            leftSection={<IconNotebook size={16} />}
            onClick={onCreateJournal}
          >
            {t('btnCreateJournal')}
          </Button>
        </Group>
      </Box>

      {/* Accounting equation: Assets = Liabilities + Equity */}
      <Box className={classes.heroEquation}>
        {metrics.map((m, i) => (
          <Box key={m.key} className={classes.heroEquationCell}>
            {i > 0 && (
              <span className={classes.heroOperator} aria-hidden="true">
                {i === 1 ? '=' : '+'}
              </span>
            )}
            <Box
              className={classes.heroMetric}
              title={hasData ? formatIDR(m.value) : undefined}
              onClick={onOpenBalanceSheet}
            >
              <Group gap={8} wrap="nowrap">
                <span className={classes.heroDot} style={{ backgroundColor: m.color }} />
                <Text className={classes.heroMetricLabel}>{m.label}</Text>
                {m.share !== undefined && hasData && (
                  <span className={classes.heroShare}>{m.share.toFixed(1)}%</span>
                )}
              </Group>
              <Text className={classes.heroMetricValue}>
                {hasData ? formatCompact(m.value) : '—'}
              </Text>
              <Text className={classes.heroMetricFull}>{hasData ? formatIDR(m.value) : '—'}</Text>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Funding structure: how assets are financed */}
      <Box className={classes.heroStructure}>
        <Box className={classes.heroBar} role="img" aria-label={t('equationTitle')}>
          <span style={{ width: `${liabPct}%`, backgroundColor: COLORS.liabilities }} />
          <span style={{ width: `${eqPct}%`, backgroundColor: COLORS.equity }} />
        </Box>
        <Group justify="space-between" mt={8} gap="xs" wrap="wrap">
          <Text className={classes.heroStructureLabel}>{t('equationTitle')}</Text>
          <Group gap="md" wrap="nowrap">
            <Group gap={6} wrap="nowrap">
              <span className={classes.heroDot} style={{ backgroundColor: COLORS.liabilities }} />
              <Text className={classes.heroStructureLabel}>
                {t('totalLiabilities')} {liabPct.toFixed(1)}%
              </Text>
            </Group>
            <Group gap={6} wrap="nowrap">
              <span className={classes.heroDot} style={{ backgroundColor: COLORS.equity }} />
              <Text className={classes.heroStructureLabel}>
                {t('totalEquity')} {eqPct.toFixed(1)}%
              </Text>
            </Group>
          </Group>
        </Group>
      </Box>
    </Box>
  );
}

export default DashboardHero;
