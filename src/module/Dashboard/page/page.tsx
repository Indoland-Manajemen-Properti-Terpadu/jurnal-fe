import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import {
  Icon3dCubeSphere,
  IconActivityHeartbeat,
  IconAlertTriangle,
  IconBuildingBank,
  IconCalendarStats,
  IconChartBar,
  IconChartPie,
  IconCoin,
  IconFileInvoice,
  IconLayoutDashboard,
  IconLock,
  IconLockOpen,
  IconNotebook,
  IconReceipt2,
  IconRefresh,
  IconScale,
  IconShieldCheck,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useAuthStore } from '@/store/useAuthentications';
import { useTranslation } from '@/i18n';
import MainDashboardLayout from './layout';
import classes from '../components/dashboard.module.css';
import { SpatialFinancialCanvas } from '../components/SpatialFinancialCanvas';
import {
  ActionBanner,
  ActivityFeed,
  AgingList,
  BankAccountsList,
  CardHeader,
  CompositionDonut,
  GlassCard,
  KpiTile,
  QuickActions,
  RecentInvoices,
  SalesTrendChart,
  SectionHeader,
  TopDebtorsList,
  formatCompact,
  formatDate,
  formatIDR,
} from '../components/DashboardWidgets';
import {
  dashboardKeys,
  useAccountingPeriods,
  useBalanceSheetSummary,
  useContactTotal,
  useJournalAuditLogs,
  usePendingChangesCount,
  useRecentSales,
} from '../hooks/useDashboardQueries';
import {
  getActivePeriod,
  getBankAccounts,
  getCashBalance,
  getFinancialHealthSummary,
  getMonthlyTrend,
  getReceivableAging,
  getSalesKpis,
  getTopDebtors,
} from '../domain/dashboardMetrics';

type WorkspaceFilter = 'all' | 'liquidity' | 'receivables' | 'operations';

function MainDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userName } = useAuthStore();
  const { t, currentLanguage } = useTranslation('dashboard');

  const [spatialMode, setSpatialMode] = useState(true);
  const [workspaceFilter, setWorkspaceFilter] = useState<WorkspaceFilter>('all');
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
  const topDebtors = useMemo(() => getTopDebtors(sales), [sales]);

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

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat(currentLanguage === 'en' ? 'en-US' : 'id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    [currentLanguage]
  );

  const showLiquidity = workspaceFilter === 'all' || workspaceFilter === 'liquidity';
  const showReceivables = workspaceFilter === 'all' || workspaceFilter === 'receivables';
  const showOperations = workspaceFilter === 'all' || workspaceFilter === 'operations';

  return (
    <MainDashboardLayout>
      <Box className={classes.stage}>
        <Box className={`${classes.orb} ${classes.orbA}`} />
        <Box className={`${classes.orb} ${classes.orbB}`} />

        <Stack gap="lg">
          {/* ---------- Priority Alert / Reassurance Banner ---------- */}
          <ActionBanner
            overdueCount={kpi.overdueCount}
            overdueAmount={kpi.overdueAmount}
            draftCount={kpi.draftCount}
            pendingCount={pendingQ.data ?? 0}
            onViewOverdue={() => navigate(routes.sales.main)}
            onViewDrafts={() => navigate(routes.sales.main)}
            onViewPending={() => navigate(routes.pendingChanges.main)}
          />

          {/* ---------- Spatial Hero Command Center ---------- */}
          <Box className={`${classes.hero} ${classes.reveal}`} p={{ base: 'lg', md: 28 }}>
            <Box className={classes.heroGrid} />
            <Grid gutter="xl" align="stretch" pos="relative">
              {/* Left Column: Greeting, Fundamental Accounting Equation & Primary Actions */}
              <Grid.Col span={{ base: 12, lg: 7 }}>
                <Stack justify="space-between" h="100%" gap="md">
                  <Box>
                    {/* Top Metadata & Spatial Toggle */}
                    <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                      <Group gap="xs">
                        <Badge
                          variant="filled"
                          radius="sm"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.14)',
                            color: 'white',
                            textTransform: 'capitalize',
                          }}
                        >
                          {today}
                        </Badge>
                        <Badge
                          variant="filled"
                          radius="sm"
                          leftSection={
                            activePeriod?.type === 'LOCK' || activePeriod?.type === 'CLOSE' ? (
                              <IconLock size={11} />
                            ) : (
                              <IconLockOpen size={11} />
                            )
                          }
                          style={{
                            backgroundColor: 'rgba(9, 178, 255, 0.24)',
                            border: '1px solid rgba(9, 178, 255, 0.45)',
                            color: '#e0f2fe',
                          }}
                        >
                          {activePeriod
                            ? t('periodLockedUntil', {
                                name: activePeriod.name,
                                date: formatDate(activePeriod.endDate, currentLanguage),
                              })
                            : t('periodUnlocked')}
                        </Badge>
                      </Group>

                      <Button
                        size="compact-xs"
                        variant={spatialMode ? 'filled' : 'outline'}
                        color="cyan"
                        radius="xl"
                        leftSection={<Icon3dCubeSphere size={14} />}
                        onClick={() => setSpatialMode((v) => !v)}
                        style={{
                          borderColor: 'rgba(255,255,255,0.3)',
                        }}
                      >
                        {spatialMode ? t('spatialModeOn') : t('spatialModeOff')}
                      </Button>
                    </Group>

                    <Title order={2} c="white" mt="sm" fz={{ base: 24, md: 30 }} fw={800}>
                      {greetingText}, {userName || 'Finance'}
                    </Title>
                    <Text c="rgba(255,255,255,0.82)" mt={6} maw={600} size="sm" lh={1.55}>
                      {t('heroSubtitle')}
                    </Text>
                  </Box>

                  {/* Fundamental Accounting Equation Strip: Assets = Liabilities + Equity */}
                  <Box>
                    <Group justify="space-between" align="center" mb={8} wrap="wrap" gap="xs">
                      <Text fz={11.5} fw={700} c="rgba(255,255,255,0.75)" tt="uppercase" lts={0.5}>
                        {t('equationTitle')}
                      </Text>
                      <Group gap="xs">
                        <Badge
                          size="xs"
                          color="cyan"
                          variant="light"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.14)',
                            color: '#e0f2fe',
                          }}
                        >
                          {t('equityShare')}: {health.equityRatio.toFixed(0)}%
                        </Badge>
                        <Badge
                          size="xs"
                          color="teal"
                          variant="light"
                          style={{
                            backgroundColor: 'rgba(20, 184, 166, 0.25)',
                            color: '#ccfbf1',
                          }}
                        >
                          {t('collectionEfficiency')}: {kpi.collectionRate.toFixed(0)}%
                        </Badge>
                      </Group>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                      {[
                        {
                          label: t('totalAssets'),
                          hint: t('totalAssetsHint'),
                          value: bs ? formatCompact(bs.totalAssets) : '—',
                          fullValue: bs ? formatIDR(bs.totalAssets) : '—',
                          icon: IconScale,
                          accent: '#38bdf8',
                          symbol: '=',
                        },
                        {
                          label: t('totalLiabilities'),
                          hint: t('totalLiabilitiesHint'),
                          value: bs ? formatCompact(bs.totalLiabilities) : '—',
                          fullValue: bs ? formatIDR(bs.totalLiabilities) : '—',
                          icon: IconReceipt2,
                          accent: '#fbbf24',
                          symbol: '+',
                        },
                        {
                          label: t('totalEquity'),
                          hint: t('totalEquityHint'),
                          value: bs ? formatCompact(bs.totalEquity) : '—',
                          fullValue: bs ? formatIDR(bs.totalEquity) : '—',
                          icon: IconChartPie,
                          accent: '#2dd4bf',
                          symbol: null,
                        },
                      ].map((m) => (
                        <Box
                          key={m.label}
                          className={classes.heroChip}
                          p="sm"
                          title={m.fullValue}
                          onClick={() => navigate(routes.resultReport.balanceSheet)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Group justify="space-between" wrap="nowrap" gap={4}>
                            <Group gap={6} c="rgba(255,255,255,0.85)" wrap="nowrap">
                              <m.icon size={15} color={m.accent} />
                              <Text size="xs" fw={700}>
                                {m.label}
                              </Text>
                            </Group>
                            {m.symbol && (
                              <Badge
                                size="xs"
                                radius="xl"
                                variant="filled"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.18)',
                                  color: 'white',
                                }}
                              >
                                {m.symbol}
                              </Badge>
                            )}
                          </Group>
                          <Text fw={800} fz={20} c="white" mt={4} lh={1.2}>
                            {m.value}
                          </Text>
                          <Text fz={11} c="rgba(255,255,255,0.68)" mt={2} truncate>
                            {m.hint}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>

                  {/* Primary Action Buttons */}
                  <Group gap="sm" wrap="wrap">
                    <Button
                      variant="white"
                      color="primary"
                      radius="xl"
                      size="sm"
                      leftSection={<IconNotebook size={16} />}
                      onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                    >
                      {t('btnCreateJournal')}
                    </Button>
                    <Button
                      variant="filled"
                      color="cyan.6"
                      radius="xl"
                      size="sm"
                      leftSection={<IconFileInvoice size={16} />}
                      onClick={() => navigate(routes.sales.main)}
                    >
                      {t('btnSalesInvoice')}
                    </Button>
                    <Button
                      variant="outline"
                      radius="xl"
                      size="sm"
                      color="white"
                      style={{ borderColor: 'rgba(255,255,255,0.38)', color: 'white' }}
                      leftSection={<IconRefresh size={16} />}
                      loading={isFetching}
                      onClick={() => queryClient.invalidateQueries({ queryKey: dashboardKeys.all })}
                    >
                      {t('btnRefresh')}
                    </Button>
                  </Group>
                </Stack>
              </Grid.Col>

              {/* Right Column: Interactive 3D Spatial Financial Core */}
              <Grid.Col span={{ base: 12, lg: 5 }}>
                <SpatialFinancialCanvas
                  totalAssets={bs?.totalAssets ?? 0}
                  totalLiabilities={bs?.totalLiabilities ?? 0}
                  totalEquity={bs?.totalEquity ?? 0}
                  cashBalance={cash}
                  isBalanced={health.isBalanced}
                  formattedAssets={bs ? formatCompact(bs.totalAssets) : 'Rp 0'}
                  formattedLiabilities={bs ? formatCompact(bs.totalLiabilities) : 'Rp 0'}
                  formattedEquity={bs ? formatCompact(bs.totalEquity) : 'Rp 0'}
                  formattedCash={formatCompact(cash)}
                  labels={{
                    badge: t('spatialEngineBadge'),
                    dragHint: t('spatialDragHint'),
                    balanced: t('equationBalanced'),
                    unbalanced: t('equationUnbalanced'),
                    viewOrbit: t('viewOrbit'),
                    viewRadar: t('viewRadar'),
                    viewIsometric: t('viewIsometric'),
                    assets: t('nodeAssets'),
                    liabilities: t('nodeLiabilities'),
                    equity: t('nodeEquity'),
                    cash: t('nodeCash'),
                  }}
                />
              </Grid.Col>
            </Grid>
          </Box>

          {/* ---------- Canonical Pill Navigation Bar for Workspace Focus ---------- */}
          <Paper withBorder radius="lg" p="xs" bg="white">
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Tabs
                value={workspaceFilter}
                onChange={(v) => setWorkspaceFilter((v as WorkspaceFilter) ?? 'all')}
                color="primary"
                variant="pills"
                radius="md"
              >
                <Tabs.List>
                  <Tabs.Tab value="all" leftSection={<IconLayoutDashboard size={15} />}>
                    {t('filterAll')}
                  </Tabs.Tab>
                  <Tabs.Tab value="liquidity" leftSection={<IconBuildingBank size={15} />}>
                    {t('filterLiquidity')}
                  </Tabs.Tab>
                  <Tabs.Tab value="receivables" leftSection={<IconChartBar size={15} />}>
                    {t('filterReceivables')}
                  </Tabs.Tab>
                  <Tabs.Tab value="operations" leftSection={<IconActivityHeartbeat size={15} />}>
                    {t('filterOperations')}
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              <Group gap="xs" pr="xs">
                <Badge variant="light" color="primary" size="md" radius="sm">
                  {t('netWorkingCapital')}: {formatCompact(health.netWorkingCapital)}
                </Badge>
              </Group>
            </Group>
          </Paper>

          {/* ---------- ZONE 1: Core Financial Pulse KPIs ---------- */}
          <SectionHeader
            icon={IconActivityHeartbeat}
            title={t('sectionPulseTitle')}
            subtitle={t('sectionPulseSubtitle')}
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

          {/* ---------- ZONE 2: Billing Cashflow & Receivable Quality ---------- */}
          {showReceivables && (
            <>
              <SectionHeader
                icon={IconChartBar}
                title={t('sectionAnalyticsTitle')}
                subtitle={t('sectionAnalyticsSubtitle')}
              />

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
            </>
          )}

          {/* ---------- ZONE 3: Liquidity & Balance Sheet Anatomy ---------- */}
          {showLiquidity && (
            <>
              <SectionHeader
                icon={IconScale}
                title={t('sectionBalanceTitle')}
                subtitle={t('sectionBalanceSubtitle')}
              />

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
                          color: '#09B2FF',
                        },
                        {
                          label: t('sliceNonCurrentAssets'),
                          value: bs?.totalNonCurrentAssets ?? 0,
                          color: '#053079',
                        },
                        {
                          label: t('sliceLiabilities'),
                          value: bs?.totalLiabilities ?? 0,
                          color: '#f59e0b',
                        },
                        {
                          label: t('sliceEquity'),
                          value: bs?.totalEquity ?? 0,
                          color: '#14b8a6',
                        },
                      ]}
                    />
                  </GlassCard>
                </Grid.Col>
              </Grid>
            </>
          )}

          {/* ---------- ZONE 4: Operational Activity, Ledger Audit & Quick Controls ---------- */}
          {showOperations && (
            <>
              <SectionHeader
                icon={IconNotebook}
                title={t('sectionOperationsTitle')}
                subtitle={t('sectionOperationsSubtitle')}
              />

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
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => navigate(routes.sales.main)}
                      >
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

                {/* Col 3: Operational Control Center + Instant Quick Actions */}
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                  <GlassCard spatialTilt={spatialMode} delay={460} h="100%">
                    <CardHeader title={t('controlTitle')} subtitle={t('controlSubtitle')} />

                    <Stack gap="xs">
                      {[
                        {
                          icon: IconShieldCheck,
                          color: (pendingQ.data ?? 0) > 0 ? 'orange' : 'teal',
                          label: t('ctrlPendingChanges'),
                          value: pendingQ.isLoading ? '…' : String(pendingQ.data ?? 0),
                          onClick: () => navigate(routes.pendingChanges.main),
                        },
                        {
                          icon: IconFileInvoice,
                          color: kpi.draftCount > 0 ? 'blue' : 'gray',
                          label: t('ctrlDraftInvoices'),
                          value: salesQ.isLoading ? '…' : String(kpi.draftCount),
                          onClick: () => navigate(routes.sales.main),
                        },
                        {
                          icon: IconUsers,
                          color: 'violet',
                          label: t('ctrlTotalContacts'),
                          value: contactsQ.isLoading ? '…' : String(contactsQ.data ?? 0),
                          onClick: () => navigate(routes.Contact.Main),
                        },
                        {
                          icon: IconCalendarStats,
                          color: activePeriod ? 'primary' : 'gray',
                          label: t('ctrlActivePeriod'),
                          value: activePeriod?.name ?? 'OPEN',
                          onClick: () => navigate(routes.PeriodAndClosingBook.ListPLandCB),
                        },
                      ].map((row) => (
                        <Group
                          key={row.label}
                          justify="space-between"
                          wrap="nowrap"
                          p={8}
                          className={classes.rowHover}
                          onClick={row.onClick}
                          style={{
                            border: '1px solid rgba(15,23,42,0.06)',
                            background: 'rgba(255,255,255,0.65)',
                          }}
                        >
                          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                            <Box
                              w={30}
                              h={30}
                              bg={`${row.color}.0`}
                              c={`${row.color}.7`}
                              style={{
                                borderRadius: 8,
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <row.icon size={16} />
                            </Box>
                            <Text size="xs" fw={600} c="dark.7" truncate>
                              {row.label}
                            </Text>
                          </Group>
                          <Badge variant="light" color={row.color} size="sm" radius="sm">
                            {row.value}
                          </Badge>
                        </Group>
                      ))}

                      <Divider my={4} label={t('quickActionsLabel')} labelPosition="center" />

                      <QuickActions
                        actions={[
                          {
                            label: t('qaGeneralJournal'),
                            icon: IconNotebook,
                            tone: 'primary',
                            onClick: () => navigate(routes.generalJournal.addTransactionJournal),
                          },
                          {
                            label: t('qaReceiveMoney'),
                            icon: IconCoin,
                            tone: 'teal',
                            onClick: () => navigate(routes.BankAndCash.AddReceiveMoney),
                          },
                          {
                            label: t('qaSendMoney'),
                            icon: IconWallet,
                            tone: 'orange',
                            onClick: () => navigate(routes.BankAndCash.AddSentMoney),
                          },
                          {
                            label: t('qaTransferCash'),
                            icon: IconBuildingBank,
                            tone: 'cyan',
                            onClick: () => navigate(routes.BankAndCash.AddTransferMoney),
                          },
                        ]}
                      />
                    </Stack>
                  </GlassCard>
                </Grid.Col>
              </Grid>
            </>
          )}
        </Stack>
      </Box>
    </MainDashboardLayout>
  );
}

export default MainDashboard;
