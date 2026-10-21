import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBuildingBank,
  IconCalendarStats,
  IconChartPie,
  IconCoin,
  IconFileInvoice,
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
import {
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

function MainDashboard() {
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

  const todayFormatted = useMemo(
    () =>
      new Intl.DateTimeFormat(currentLanguage === 'en' ? 'en-US' : 'id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    [currentLanguage]
  );

  const eqShare = Math.min(100, Math.max(0, health.equityRatio));
  const liabShare = Math.min(100 - eqShare, Math.max(0, health.liabilityRatio));

  return (
    <MainDashboardLayout>
      <Box className={classes.stage}>
        <Box className={`${classes.orb} ${classes.orbA}`} />
        <Box className={`${classes.orb} ${classes.orbB}`} />

        <Stack gap="lg">
          {/* ---------- Executive Financial Overview Hero ---------- */}
          <Box className={`${classes.hero} ${classes.reveal}`} p={{ base: 'lg', md: 28 }}>
            <Box className={classes.heroGrid} />

            {/* Top Executive Status Bar */}
            <Group
              justify="space-between"
              align="center"
              wrap="wrap"
              gap="xs"
              pos="relative"
              pb="md"
              mb="md"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.14)' }}
            >
              <Group gap={8} wrap="wrap">
                <Badge
                  variant="filled"
                  radius="md"
                  size="md"
                  leftSection={<IconCalendarStats size={13} />}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.13)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    color: '#fff',
                    textTransform: 'capitalize',
                    fontWeight: 600,
                  }}
                >
                  {todayFormatted}
                </Badge>

                <Badge
                  variant="filled"
                  radius="md"
                  size="md"
                  onClick={() => navigate(routes.PeriodAndClosingBook.ListPLandCB)}
                  leftSection={
                    activePeriod?.type === 'LOCK' || activePeriod?.type === 'CLOSE' ? (
                      <IconLock size={12} />
                    ) : (
                      <IconLockOpen size={12} />
                    )
                  }
                  style={{
                    backgroundColor: 'rgba(9, 178, 255, 0.22)',
                    border: '1px solid rgba(125, 211, 252, 0.42)',
                    color: '#f0f9ff',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {activePeriod
                    ? t('periodLockedUntil', {
                        name: activePeriod.name,
                        date: formatDate(activePeriod.endDate, currentLanguage),
                      })
                    : t('periodUnlocked')}
                </Badge>

                <Badge
                  variant="filled"
                  radius="md"
                  size="md"
                  leftSection={
                    <Box
                      w={7}
                      h={7}
                      style={{
                        borderRadius: '50%',
                        backgroundColor: health.isBalanced ? '#34d399' : '#fbbf24',
                        boxShadow: health.isBalanced
                          ? '0 0 8px #34d399'
                          : '0 0 8px #fbbf24',
                      }}
                    />
                  }
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.11)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#f8fafc',
                    fontWeight: 600,
                  }}
                >
                  {health.isBalanced ? t('equationBalanced') : t('equationUnbalanced')}
                </Badge>
              </Group>

              <Group gap="xs" wrap="nowrap">
                {(pendingQ.data ?? 0) > 0 && (
                  <Badge
                    variant="filled"
                    radius="md"
                    size="md"
                    leftSection={<IconShieldCheck size={13} />}
                    onClick={() => navigate(routes.pendingChanges.main)}
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.28)',
                      border: '1px solid rgba(252, 211, 77, 0.5)',
                      color: '#fef3c7',
                      cursor: 'pointer',
                    }}
                  >
                    {t('alertPendingCount', { count: pendingQ.data ?? 0 })}
                  </Badge>
                )}

                <Tooltip label={t('btnRefresh')} withArrow>
                  <Button
                    size="compact-sm"
                    radius="md"
                    className={classes.heroGlassBtn}
                    leftSection={<IconRefresh size={14} />}
                    loading={isFetching}
                    onClick={() => queryClient.invalidateQueries({ queryKey: dashboardKeys.all })}
                  >
                    {t('btnRefresh')}
                  </Button>
                </Tooltip>
              </Group>
            </Group>

            {/* Main 2-Column Hero Content */}
            <Grid gutter="xl" align="stretch" pos="relative">
              {/* Left Column: Executive Greeting, Liquidity Highlights & Quick CTAs */}
              <Grid.Col span={{ base: 12, lg: 5 }}>
                <Stack justify="space-between" h="100%" gap="md">
                  <Box>
                    <Title
                      order={2}
                      c="white"
                      fz={{ base: 24, md: 30 }}
                      fw={800}
                      style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}
                    >
                      {greetingText}, {userName || 'Finance'}
                    </Title>
                    <Text c="rgba(255, 255, 255, 0.84)" mt={8} fz={13.5} lh={1.6}>
                      {t('heroSubtitle')}
                    </Text>
                  </Box>

                  {/* Executive Pulse Strip */}
                  <SimpleGrid cols={2} spacing="sm">
                    <Box
                      className={classes.heroMetricPill}
                      title={formatIDR(health.netWorkingCapital)}
                    >
                      <Text
                        fz={10.5}
                        fw={700}
                        c="rgba(255, 255, 255, 0.72)"
                        tt="uppercase"
                        lts={0.5}
                      >
                        {t('netWorkingCapital')}
                      </Text>
                      <Text fw={800} fz={18} c="white" mt={2} lh={1.25}>
                        {bs ? formatCompact(health.netWorkingCapital) : '—'}
                      </Text>
                      <Text
                        fz={11}
                        ff="monospace"
                        c="rgba(255, 255, 255, 0.72)"
                        mt={2}
                        truncate
                      >
                        {bs ? formatIDR(health.netWorkingCapital) : '—'}
                      </Text>
                    </Box>

                    <Box className={classes.heroMetricPill}>
                      <Text
                        fz={10.5}
                        fw={700}
                        c="rgba(255, 255, 255, 0.72)"
                        tt="uppercase"
                        lts={0.5}
                      >
                        {t('collectionEfficiency')}
                      </Text>
                      <Group gap={8} align="baseline" mt={2}>
                        <Text fw={800} fz={18} c="#a7f3d0" lh={1.25}>
                          {kpi.collectionRate.toFixed(1)}%
                        </Text>
                        <Badge
                          size="xs"
                          radius="sm"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.16)',
                            color: '#fff',
                          }}
                        >
                          Kas {health.cashRatio.toFixed(0)}%
                        </Badge>
                      </Group>
                      <Text fz={11} c="rgba(255, 255, 255, 0.72)" mt={2} truncate>
                        {t('equityShare')}: {health.equityRatio.toFixed(1)}%
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Primary Action Buttons */}
                  <Group gap="sm" wrap="wrap">
                    <Button
                      variant="white"
                      color="primary"
                      radius="md"
                      size="sm"
                      fw={700}
                      leftSection={<IconNotebook size={16} />}
                      style={{
                        boxShadow: '0 8px 20px -6px rgba(2, 16, 43, 0.45)',
                      }}
                      onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                    >
                      {t('btnCreateJournal')}
                    </Button>
                    <Button
                      radius="md"
                      size="sm"
                      fw={600}
                      className={classes.heroGlassBtn}
                      leftSection={<IconFileInvoice size={16} />}
                      onClick={() => navigate(routes.sales.main)}
                    >
                      {t('btnViewAllSales')}
                    </Button>
                    <Button
                      radius="md"
                      size="sm"
                      fw={600}
                      className={classes.heroGlassBtn}
                      leftSection={<IconScale size={16} />}
                      onClick={() => navigate(routes.resultReport.balanceSheet)}
                    >
                      {t('btnViewBalanceSheet')}
                    </Button>
                  </Group>
                </Stack>
              </Grid.Col>

              {/* Right Column: Frosted Glass Balance Sheet Equation Terminal */}
              <Grid.Col span={{ base: 12, lg: 7 }}>
                <Box className={classes.heroPanel} p={{ base: 'md', sm: 18 }} h="100%">
                  <Stack justify="space-between" h="100%" gap="sm">
                    <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                      <Group gap={8} wrap="nowrap">
                        <Box
                          w={26}
                          h={26}
                          style={{
                            borderRadius: 7,
                            backgroundColor: 'rgba(56, 189, 248, 0.2)',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <IconScale size={15} color="#7dd3fc" />
                        </Box>
                        <Box>
                          <Text fz={11.5} fw={800} c="white" tt="uppercase" lts={0.6}>
                            {t('equationTitle')}
                          </Text>
                        </Box>
                      </Group>

                      <Badge
                        size="sm"
                        radius="sm"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.14)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#e0f2fe',
                          fontWeight: 700,
                        }}
                      >
                        {t('totalAssets')} = {t('totalLiabilities')} + {t('totalEquity')}
                      </Badge>
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
                          badgeText: '100%',
                          symbol: '=',
                        },
                        {
                          label: t('totalLiabilities'),
                          hint: t('totalLiabilitiesHint'),
                          value: bs ? formatCompact(bs.totalLiabilities) : '—',
                          fullValue: bs ? formatIDR(bs.totalLiabilities) : '—',
                          icon: IconReceipt2,
                          accent: '#fbbf24',
                          badgeText: `${health.liabilityRatio.toFixed(0)}%`,
                          symbol: '+',
                        },
                        {
                          label: t('totalEquity'),
                          hint: t('totalEquityHint'),
                          value: bs ? formatCompact(bs.totalEquity) : '—',
                          fullValue: bs ? formatIDR(bs.totalEquity) : '—',
                          icon: IconChartPie,
                          accent: '#34d399',
                          badgeText: `${health.equityRatio.toFixed(0)}%`,
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
                            <Group gap={6} c="rgba(255, 255, 255, 0.9)" wrap="nowrap">
                              <m.icon size={15} color={m.accent} />
                              <Text size="xs" fw={700} truncate>
                                {m.label}
                              </Text>
                            </Group>
                            <Group gap={4} wrap="nowrap">
                              <Badge
                                size="xs"
                                radius="sm"
                                variant="filled"
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                                  color: '#e2e8f0',
                                }}
                              >
                                {m.badgeText}
                              </Badge>
                              {m.symbol && (
                                <Badge
                                  size="xs"
                                  radius="xl"
                                  variant="filled"
                                  style={{
                                    backgroundColor: 'rgba(9, 178, 255, 0.32)',
                                    color: 'white',
                                  }}
                                >
                                  {m.symbol}
                                </Badge>
                              )}
                            </Group>
                          </Group>

                          <Text fw={800} fz={20} c="white" mt={6} lh={1.2}>
                            {m.value}
                          </Text>
                          <Text
                            fz={11}
                            ff="monospace"
                            c="rgba(255, 255, 255, 0.8)"
                            mt={2}
                            truncate
                          >
                            {m.fullValue}
                          </Text>
                          <Text fz={10.5} c="rgba(255, 255, 255, 0.62)" mt={4} truncate>
                            {m.hint}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>

                    {/* Visual Capital Structure Proportion Bar */}
                    <Box pt={4}>
                      <Group justify="space-between" mb={5} wrap="wrap" gap={6}>
                        <Group gap={6}>
                          <Box
                            w={8}
                            h={8}
                            style={{ borderRadius: 2, backgroundColor: '#34d399' }}
                          />
                          <Text fz={11} fw={600} c="rgba(255, 255, 255, 0.85)">
                            {t('totalEquity')}: {health.equityRatio.toFixed(1)}%
                          </Text>
                        </Group>
                        <Group gap={6}>
                          <Box
                            w={8}
                            h={8}
                            style={{ borderRadius: 2, backgroundColor: '#fbbf24' }}
                          />
                          <Text fz={11} fw={600} c="rgba(255, 255, 255, 0.85)">
                            {t('totalLiabilities')}: {health.liabilityRatio.toFixed(1)}%
                          </Text>
                        </Group>
                      </Group>
                      <Box
                        h={7}
                        w="100%"
                        style={{
                          borderRadius: 999,
                          backgroundColor: 'rgba(255, 255, 255, 0.14)',
                          overflow: 'hidden',
                          display: 'flex',
                        }}
                      >
                        <Box
                          h="100%"
                          w={`${eqShare}%`}
                          style={{
                            background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                            transition: 'width 400ms ease',
                          }}
                        />
                        <Box
                          h="100%"
                          w={`${liabShare}%`}
                          style={{
                            background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                            transition: 'width 400ms ease',
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Grid.Col>
            </Grid>
          </Box>

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
        </Stack>
      </Box>
    </MainDashboardLayout>
  );
}

export default MainDashboard;
