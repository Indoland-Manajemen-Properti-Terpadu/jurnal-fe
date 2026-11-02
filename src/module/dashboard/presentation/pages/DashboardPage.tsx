import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Grid,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Alert,
} from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { routes } from '@/router/routes';
import { useAuthStore } from '@/store/useAuthentications';
import { useTranslation } from '@/i18n';
import classes from '@/module/dashboard/presentation/components/dashboard.module.css';
import { DashboardHero } from '@/module/dashboard/presentation/components/DashboardHero';
import { ActivityFeed } from '@/module/dashboard/presentation/components/ActivityFeed';
import { AgingList } from '@/module/dashboard/presentation/components/AgingList';
import { BankAccountsList } from '@/module/dashboard/presentation/components/BankAccountsList';
import { CardHeader } from '@/module/dashboard/presentation/components/CardHeader';
import { BalancePosition } from '@/module/dashboard/presentation/components/BalancePosition';
import { GlassCard } from '@/module/dashboard/presentation/components/GlassCard';
import { ControlCenterCard } from '@/module/dashboard/presentation/components/ControlCenterCard';
import {
  MiniBars,
  CollectionRing,
  OverdueShare,
} from '@/module/dashboard/presentation/components/MetricVisual';
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
  getMonthlyNetSalesTrend,
  getReceivableAging,
  getSalesKpis,
  getTopDebtors,
} from '@/module/dashboard/domain/dashboardMetrics';

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userName } = useAuthStore();
  const { t, currentLanguage } = useTranslation('dashboard');

  const [receivableTab, setReceivableTab] = useState<'debtors' | 'invoices'>('debtors');

  const balanceQ = useBalanceSheetSummary();
  const salesQ = useRecentSales();
  const pendingQ = usePendingChangesCount();
  const periodsQ = useAccountingPeriods();
  const auditQ = useJournalAuditLogs();

  const sales = useMemo(() => salesQ.data?.items ?? [], [salesQ.data]);
  const kpi = useMemo(() => getSalesKpis(sales), [sales]);
  const trend = useMemo(
    () => getMonthlyTrend(sales, 6, new Date(), currentLanguage),
    [sales, currentLanguage]
  );
  const netSalesTrend = useMemo(() => getMonthlyNetSalesTrend(sales, trend), [sales, trend]);
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

  const isFetching = [balanceQ, salesQ, pendingQ, periodsQ, auditQ].some((q) => q.isFetching);

  const greetingText = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return t('greetingMorning');
    if (h < 15) return t('greetingAfternoon');
    if (h < 19) return t('greetingEvening');
    return t('greetingNight');
  }, [currentLanguage]);

  return (
    <AppShellLayout withFooter>
      <Stack className={classes.stage} gap="lg">
        <DashboardHero
          greeting={greetingText}
          userName={userName || t('userFallback')}
          isRefreshing={isFetching}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: dashboardKeys.all })}
          onCreateJournal={() => navigate(routes.journalEntries.add)}
        />

        {[balanceQ, salesQ, pendingQ, periodsQ, auditQ].some((q) => q.isError) && (
          <Alert color="orange" title={t('dataErrorTitle')}>
            {t('dataErrorDescription')}
          </Alert>
        )}
        <SimpleGrid className={classes.kpiStrip} cols={{ base: 1, xs: 2, xl: 4 }} spacing="sm">
          <KpiTile
            visual={
              !balanceQ.isError && (
                <MiniBars
                  points={bankAccounts
                    .filter((account) => account.balance > 0)
                    .slice(0, 6)
                    .map((account) => ({ label: account.accountName, value: account.balance }))}
                  label={t('miniAccounts')}
                />
              )
            }
            label={t('kpiCashLabel')}
            value={balanceQ.isError ? '—' : formatIDR(cash)}
            compactValue={balanceQ.isError ? '—' : formatCompact(cash, currentLanguage)}
            loading={balanceQ.isLoading}
            hint={!balanceQ.isError && t('kpiCashHint', { count: bankAccounts.length })}
            onClick={() => navigate(routes.bankCash.main)}
          />
          <KpiTile
            visual={
              !salesQ.isError &&
              kpi.totalInvoiced > 0 && (
                <CollectionRing rate={kpi.collectionRate} label={t('miniCollected')} />
              )
            }
            label={t('kpiReceivableLabel')}
            value={salesQ.isError ? '—' : formatIDR(kpi.outstanding)}
            compactValue={salesQ.isError ? '—' : formatCompact(kpi.outstanding, currentLanguage)}
            loading={salesQ.isLoading}
            hint={!salesQ.isError && t('kpiReceivableHint', { count: kpi.openCount })}
            onClick={() => navigate(routes.sales.main)}
          />
          <KpiTile
            visual={
              !salesQ.isError && (
                <OverdueShare
                  amount={kpi.overdueAmount}
                  total={kpi.outstanding}
                  label={t('miniOfReceivables')}
                />
              )
            }
            label={t('kpiOverdueLabel')}
            value={salesQ.isError ? '—' : formatIDR(kpi.overdueAmount)}
            compactValue={salesQ.isError ? '—' : formatCompact(kpi.overdueAmount, currentLanguage)}
            loading={salesQ.isLoading}
            hint={
              salesQ.isError
                ? null
                : kpi.overdueCount > 0
                  ? t('kpiOverdueHintActive', { count: kpi.overdueCount })
                  : t('kpiOverdueHintClear')
            }
            onClick={() => navigate(routes.sales.main)}
          />
          <KpiTile
            visual={
              !salesQ.isError && <MiniBars points={netSalesTrend} label={t('miniSixMonths')} />
            }
            label={t('kpiRevenueLabel')}
            value={salesQ.isError ? '—' : formatIDR(kpi.monthRevenue)}
            compactValue={salesQ.isError ? '—' : formatCompact(kpi.monthRevenue, currentLanguage)}
            loading={salesQ.isLoading}
            hint={
              !salesQ.isError &&
              t('kpiRevenueHint', { count: kpi.monthCount, draft: kpi.draftCount })
            }
            onClick={() => navigate(routes.sales.main)}
          />
        </SimpleGrid>
        <Text size="xs" c="dimmed" className={classes.scopeNote}>
          {t('salesScope', { count: sales.length })}
        </Text>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <GlassCard h="100%">
              <CardHeader
                title={t('trendTitle')}
                subtitle={t('trendSubtitle')}
                right={
                  <Badge variant="light" color="primary" size="lg" radius="md">
                    {salesQ.isError || salesQ.isLoading
                      ? '—'
                      : t('collectionBadge', { rate: kpi.collectionRate.toFixed(0) })}
                  </Badge>
                }
              />
              {salesQ.isError ? (
                <Text size="sm" c="dimmed">
                  {t('dataErrorDescription')}
                </Text>
              ) : (
                <SalesTrendChart data={trend} loading={salesQ.isLoading} />
              )}
            </GlassCard>
          </Grid.Col>

          <ControlCenterCard
            pendingCount={pendingQ.data ?? 0}
            pendingLoading={pendingQ.isLoading}
            pendingError={pendingQ.isError}
            draftError={salesQ.isError}
            draftCount={kpi.draftCount}
            draftLoading={salesQ.isLoading}
            activePeriodName={periodsQ.isError || periodsQ.isLoading ? '—' : activePeriod?.name}
          />
        </Grid>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <GlassCard h="100%">
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

              {salesQ.isError ? (
                <Text size="sm" c="dimmed">
                  {t('dataErrorDescription')}
                </Text>
              ) : receivableTab === 'debtors' ? (
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

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <GlassCard h="100%">
              <CardHeader title={t('agingTitle')} subtitle={t('agingSubtitle')} />
              {salesQ.isError ? (
                <Text size="sm" c="dimmed">
                  {t('dataErrorDescription')}
                </Text>
              ) : (
                <AgingList buckets={aging} loading={salesQ.isLoading} />
              )}
            </GlassCard>
          </Grid.Col>
        </Grid>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <GlassCard h="100%">
              <CardHeader
                title={t('bankTitle')}
                subtitle={t('bankSubtitle')}
                right={
                  <Button
                    variant="light"
                    color="primary"
                    size="xs"
                    radius="md"
                    onClick={() => navigate(routes.bankCash.main)}
                  >
                    {t('btnManageCash')}
                  </Button>
                }
              />
              {balanceQ.isError ? (
                <Text size="sm" c="dimmed">
                  {t('dataErrorDescription')}
                </Text>
              ) : (
                <BankAccountsList
                  accounts={bankAccounts}
                  loading={balanceQ.isLoading}
                  onOpenAccount={() => navigate(routes.bankCash.main)}
                />
              )}
            </GlassCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <GlassCard h="100%">
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
                    onClick={() => navigate(routes.reports.balanceSheet)}
                  >
                    {t('btnViewBalanceSheet')}
                  </Button>
                }
              />
              <BalancePosition
                hasData={Boolean(bs) && !balanceQ.isError}
                loading={balanceQ.isLoading}
                isBalanced={health.isBalanced}
                assets={health.totalAssets}
                liabilities={health.totalLiabilities}
                equity={health.totalEquity}
                liabilityRatio={health.liabilityRatio}
                equityRatio={health.equityRatio}
                workingCapital={health.netWorkingCapital}
              />
            </GlassCard>
          </Grid.Col>
        </Grid>

        <Grid gutter="lg">
          <Grid.Col span={12}>
            <GlassCard h="100%">
              <CardHeader title={t('activityTitle')} subtitle={t('activitySubtitle')} />
              {auditQ.isError ? (
                <Text size="sm" c="dimmed">
                  {t('dataErrorDescription')}
                </Text>
              ) : (
                <ActivityFeed
                  items={auditQ.data ?? []}
                  loading={auditQ.isLoading}
                  onOpen={(a) =>
                    a.journalId &&
                    navigate(routes.journalEntries.detail.replace(':idTransaction', a.journalId))
                  }
                />
              )}
            </GlassCard>
          </Grid.Col>
        </Grid>
      </Stack>
    </AppShellLayout>
  );
}

export default DashboardPage;
