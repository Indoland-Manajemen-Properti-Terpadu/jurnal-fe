import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Grid,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
} from '@mantine/core';
import { IconAlertTriangle, IconBuildingBank, IconCoin, IconWallet } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import { routes } from '@/router/routes';
import { useAuthStore } from '@/store/useAuthentications';
import { useTranslation } from '@/i18n';
import classes from '@/module/dashboard/presentation/components/dashboard.module.css';
import { DashboardHero } from '@/module/dashboard/presentation/components/DashboardHero';
import { ActivityFeed } from '@/module/dashboard/presentation/components/ActivityFeed';
import { AgingList } from '@/module/dashboard/presentation/components/AgingList';
import { BankAccountsList } from '@/module/dashboard/presentation/components/BankAccountsList';
import { CardHeader } from '@/module/dashboard/presentation/components/CardHeader';
import { CompositionDonut } from '@/module/dashboard/presentation/components/CompositionDonut';
import { GlassCard } from '@/module/dashboard/presentation/components/GlassCard';
import { ControlCenterCard } from '@/module/dashboard/presentation/components/ControlCenterCard';
import { KpiTile } from '@/module/dashboard/presentation/components/KpiTile';
import { RecentInvoices } from '@/module/dashboard/presentation/components/RecentInvoices';
import { SalesTrendChart } from '@/module/dashboard/presentation/components/SalesTrendChart';
import { TopDebtorsList } from '@/module/dashboard/presentation/components/TopDebtorsList';
import {
  formatCompact,
  formatDate,
  formatIDR,
} from '@/module/dashboard/presentation/components/dashboardFormat';
import {
  dashboardKeys,
  useAccountingPeriods,
  useBalanceSheetSummary,
  useContactTotal,
  useJournalAuditLogs,
  usePendingChangesCount,
  useRecentSales,
} from '@/module/dashboard/presentation/hooks/useDashboardQueries';
import {
  getActivePeriod,
  getBankAccounts,
  getCashBalance,
  getFinancialHealthSummary,
  getMonthlyTrend,
  getReceivableAging,
  getSalesKpis,
  getTopDebtors,
} from '@/module/dashboard/domain/dashboardMetrics';

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userName } = useAuthStore();
  const { t, currentLanguage } = useTranslation('dashboard');

  const spatialMode = false;
  const [receivableTab, setReceivableTab] = useState<'debtors' | 'invoices'>('debtors');

  const balanceQ = useBalanceSheetSummary();
  const salesQ = useRecentSales();
  const pendingQ = usePendingChangesCount();
  const periodsQ = useAccountingPeriods();
  const auditQ = useJournalAuditLogs();
  const contactsQ = useContactTotal();

  const sales = useMemo(() => salesQ.data?.items ?? [], [salesQ.data]);
  const kpi = useMemo(() => getSalesKpis(sales), [sales]);
  const trend = useMemo(
    () => getMonthlyTrend(sales, 6, new Date(), currentLanguage),
    [sales, currentLanguage]
  );
  const aging = useMemo(
    () =>
      getReceivableAging(sales, new Date(), {
        current: t('agingBucketCurrent'),
        d1_30: t('agingBucket1_30'),
        d31_60: t('agingBucket31_60'),
        d60Plus: t('agingBucket60Plus'),
      }),
    [sales, currentLanguage]
  );

  const cash = getCashBalance(balanceQ.data);
  const activePeriod = getActivePeriod(periodsQ.data ?? []);
  const bs = balanceQ.data;
  const health = useMemo(() => getFinancialHealthSummary(bs, cash), [bs, cash]);

  const bankAccounts = useMemo(() => getBankAccounts(balanceQ.data), [balanceQ.data]);
  const topDebtors = useMemo(
    () => getTopDebtors(sales, new Date(), 5, t('generalCustomer')),
    [sales, currentLanguage]
  );

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort(
          (a, b) =>
            new Date(b.transactionDate ?? 0).getTime() - new Date(a.transactionDate ?? 0).getTime()
        )
        .slice(0, 8),
    [sales]
  );

  const isFetching = [balanceQ, salesQ, pendingQ, periodsQ, auditQ, contactsQ].some(
    (q) => q.isFetching
  );

  const greetingText = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return t('greetingMorning');
    if (h < 15) return t('greetingAfternoon');
    if (h < 19) return t('greetingEvening');
    return t('greetingNight');
  }, [currentLanguage]);

  return (
    <AppShellLayout withFooter>
      <Box className={classes.stage}>
        <Box className={`${classes.orb} ${classes.orbA}`} />
        <Box className={`${classes.orb} ${classes.orbB}`} />

        <Stack gap="lg">
          {/* ---------- Financial overview hero ---------- */}
          <DashboardHero
            greeting={greetingText}
            userName={userName || t('userFallback')}
            periodLabel={
              activePeriod
                ? t('periodLockedUntil', {
                    name: activePeriod.name,
                    date: formatDate(activePeriod.endDate, currentLanguage),
                  })
                : t('periodUnlocked')
            }
            isPeriodLocked={activePeriod?.type === 'LOCK' || activePeriod?.type === 'CLOSE'}
            isBalanced={health.isBalanced}
            hasData={Boolean(bs)}
            totalAssets={health.totalAssets}
            totalLiabilities={health.totalLiabilities}
            totalEquity={health.totalEquity}
            liabilityRatio={health.liabilityRatio}
            equityRatio={health.equityRatio}
            isRefreshing={isFetching}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: dashboardKeys.all })}
            onOpenPeriod={() => navigate(routes.PeriodAndClosingBook.ListPLandCB)}
            onOpenBalanceSheet={() => navigate(routes.resultReport.balanceSheet)}
            onCreateJournal={() => navigate(routes.generalJournal.addTransactionJournal)}
          />

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <KpiTile
              label={t('kpiCashLabel')}
              value={formatIDR(cash)}
              description={t('kpiCashDesc')}
              icon={IconBuildingBank}
              tone="primary"
              loading={balanceQ.isLoading}
              delay={40}
              spatialTilt={spatialMode}
              hint={t('kpiCashHint', { count: bankAccounts.length })}
              onClick={() => navigate(routes.BankAndCash.Main)}
            />
            <KpiTile
              label={t('kpiReceivableLabel')}
              value={formatIDR(kpi.outstanding)}
              description={t('kpiReceivableDesc')}
              icon={IconWallet}
              tone="cyan"
              loading={salesQ.isLoading}
              delay={90}
              spatialTilt={spatialMode}
              hint={t('kpiReceivableHint', { count: kpi.openCount })}
              onClick={() => navigate(routes.sales.main)}
            />
            <KpiTile
              label={t('kpiOverdueLabel')}
              value={formatIDR(kpi.overdueAmount)}
              description={t('kpiOverdueDesc')}
              icon={IconAlertTriangle}
              tone={kpi.overdueCount > 0 ? 'red' : 'teal'}
              loading={salesQ.isLoading}
              delay={140}
              spatialTilt={spatialMode}
              hint={
                kpi.overdueCount > 0
                  ? t('kpiOverdueHintActive', { count: kpi.overdueCount })
                  : t('kpiOverdueHintClear')
              }
              onClick={() => navigate(routes.sales.main)}
            />
            <KpiTile
              label={t('kpiRevenueLabel')}
              value={formatIDR(kpi.monthRevenue)}
              description={t('kpiRevenueDesc')}
              icon={IconCoin}
              tone="teal"
              loading={salesQ.isLoading}
              delay={190}
              spatialTilt={spatialMode}
              hint={t('kpiRevenueHint', { count: kpi.monthCount, draft: kpi.draftCount })}
              onClick={() => navigate(routes.sales.main)}
            />
          </SimpleGrid>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <GlassCard spatialTilt={spatialMode} delay={220} h="100%">
                <CardHeader
                  title={t('trendTitle')}
                  subtitle={t('trendSubtitle')}
                  right={
                    <Badge
                      variant="light"
                      color={kpi.collectionRate >= 80 ? 'teal' : 'orange'}
                      size="lg"
                      radius="md"
                    >
                      {t('collectionBadge', { rate: kpi.collectionRate.toFixed(0) })}
                    </Badge>
                  }
                />
                <SalesTrendChart data={trend} loading={salesQ.isLoading} />
              </GlassCard>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <GlassCard spatialTilt={spatialMode} delay={260} h="100%">
                <CardHeader title={t('agingTitle')} subtitle={t('agingSubtitle')} />
                <AgingList buckets={aging} loading={salesQ.isLoading} />
              </GlassCard>
            </Grid.Col>
          </Grid>

          <Grid gutter="lg">
            {/* Cash & Bank Accounts Distribution */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <GlassCard spatialTilt={spatialMode} delay={300} h="100%">
                <CardHeader
                  title={t('bankTitle')}
                  subtitle={t('bankSubtitle')}
                  right={
                    <Button
                      variant="light"
                      color="primary"
                      size="xs"
                      radius="md"
                      onClick={() => navigate(routes.BankAndCash.Main)}
                    >
                      {t('btnManageCash')}
                    </Button>
                  }
                />
                <BankAccountsList
                  accounts={bankAccounts}
                  loading={balanceQ.isLoading}
                  onOpenAccount={() => navigate(routes.BankAndCash.Main)}
                />
              </GlassCard>
            </Grid.Col>

            {/* Balance Sheet Composition Donut + Net Working Capital */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <GlassCard spatialTilt={spatialMode} delay={340} h="100%">
                <CardHeader
                  title={t('compositionTitle')}
                  subtitle={
                    bs
                      ? t('compositionSubtitleWithDate', {
                          date: formatDate(bs.endDate, currentLanguage),
                        })
                      : t('compositionSubtitleDefault')
                  }
                  right={
                    <Button
                      variant="light"
                      color="primary"
                      size="xs"
                      radius="md"
                      onClick={() => navigate(routes.resultReport.balanceSheet)}
                    >
                      {t('btnViewBalanceSheet')}
                    </Button>
                  }
                />
                <CompositionDonut
                  loading={balanceQ.isLoading}
                  centerLabel={t('totalAssets')}
                  centerValue={bs ? formatCompact(bs.totalAssets) : '—'}
                  netWorkingCapital={bs ? health.netWorkingCapital : undefined}
                  slices={[
                    {
                      label: t('sliceCurrentAssets'),
                      value: bs?.totalCurrentAssets ?? 0,
                      color: 'var(--mantine-color-secondary-6)',
                    },
                    {
                      label: t('sliceNonCurrentAssets'),
                      value: bs?.totalNonCurrentAssets ?? 0,
                      color: 'var(--mantine-color-primary-6)',
                    },
                    {
                      label: t('sliceLiabilities'),
                      value: bs?.totalLiabilities ?? 0,
                      color: 'var(--mantine-color-amber-5)',
                    },
                    {
                      label: t('sliceEquity'),
                      value: bs?.totalEquity ?? 0,
                      color: 'var(--mantine-color-teal-5)',
                    },
                  ]}
                />
              </GlassCard>
            </Grid.Col>
          </Grid>

          <Grid gutter="lg">
            {/* Col 1: Tabbed Collection Priority & Recent Sales Invoices */}
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <GlassCard spatialTilt={spatialMode} delay={380} h="100%">
                <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="xs">
                  <SegmentedControl
                    size="xs"
                    radius="md"
                    color="primary"
                    value={receivableTab}
                    onChange={(v) => setReceivableTab(v as 'debtors' | 'invoices')}
                    data={[
                      { label: t('tabTopDebtors'), value: 'debtors' },
                      { label: t('tabRecentInvoices'), value: 'invoices' },
                    ]}
                  />
                  <Button variant="subtle" size="xs" onClick={() => navigate(routes.sales.main)}>
                    {t('btnViewAllSales')}
                  </Button>
                </Group>

                {receivableTab === 'debtors' ? (
                  <TopDebtorsList
                    debtors={topDebtors}
                    loading={salesQ.isLoading}
                    onOpenDebtor={() => navigate(routes.sales.main)}
                  />
                ) : (
                  <RecentInvoices
                    items={recentSales}
                    loading={salesQ.isLoading}
                    onOpen={(s) => navigate(routes.sales.detail.replace(':id', s.id))}
                  />
                )}
              </GlassCard>
            </Grid.Col>

            {/* Col 2: General Ledger Audit Trail */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <GlassCard spatialTilt={spatialMode} delay={420} h="100%">
                <CardHeader title={t('activityTitle')} subtitle={t('activitySubtitle')} />
                <ActivityFeed
                  items={auditQ.data ?? []}
                  loading={auditQ.isLoading}
                  onOpen={(a) =>
                    a.journalId &&
                    navigate(
                      routes.generalJournal.detailTransactionJournal.replace(
                        ':idTransaction',
                        a.journalId
                      )
                    )
                  }
                />
              </GlassCard>
            </Grid.Col>

            <ControlCenterCard
              pendingCount={pendingQ.data ?? 0}
              pendingLoading={pendingQ.isLoading}
              draftCount={kpi.draftCount}
              draftLoading={salesQ.isLoading}
              contactTotal={contactsQ.data ?? 0}
              contactsLoading={contactsQ.isLoading}
              activePeriodName={activePeriod?.name}
            />
          </Grid>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default DashboardPage;
