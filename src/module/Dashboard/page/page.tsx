import { useMemo } from 'react';
import { Badge, Box, Button, Grid, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
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
import MainDashboardLayout from './layout';
import classes from '../components/dashboard.module.css';
import {
  ActivityFeed,
  AgingList,
  CardHeader,
  CompositionDonut,
  GlassCard,
  KpiTile,
  QuickActions,
  RecentInvoices,
  SalesTrendChart,
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
  getCashBalance,
  getMonthlyTrend,
  getReceivableAging,
  getSalesKpis,
} from '../domain/dashboardMetrics';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 19) return 'Selamat sore';
  return 'Selamat malam';
};

function MainDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userName } = useAuthStore();

  const balanceQ = useBalanceSheetSummary();
  const salesQ = useRecentSales();
  const pendingQ = usePendingChangesCount();
  const periodsQ = useAccountingPeriods();
  const auditQ = useJournalAuditLogs();
  const contactsQ = useContactTotal();

  const sales = useMemo(() => salesQ.data?.items ?? [], [salesQ.data]);
  const kpi = useMemo(() => getSalesKpis(sales), [sales]);
  const trend = useMemo(() => getMonthlyTrend(sales), [sales]);
  const aging = useMemo(() => getReceivableAging(sales), [sales]);
  const cash = getCashBalance(balanceQ.data);
  const activePeriod = getActivePeriod(periodsQ.data ?? []);
  const bs = balanceQ.data;

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort((a, b) => new Date(b.transactionDate ?? 0).getTime() - new Date(a.transactionDate ?? 0).getTime())
        .slice(0, 8),
    [sales]
  );

  const isFetching = [balanceQ, salesQ, pendingQ, periodsQ, auditQ, contactsQ].some((q) => q.isFetching);
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <MainDashboardLayout>
      <Box className={classes.stage}>
        <Box className={`${classes.orb} ${classes.orbA}`} />
        <Box className={`${classes.orb} ${classes.orbB}`} />

        <Stack gap="lg">
          {/* ---------- Hero ---------- */}
          <Box className={`${classes.hero} ${classes.reveal}`} p={{ base: 'lg', md: 32 }}>
            <Box className={classes.heroGrid} />
            <Grid gutter="xl" align="center" pos="relative">
              <Grid.Col span={{ base: 12, lg: 6 }}>
                <Text size="sm" c="rgba(255,255,255,0.75)" tt="capitalize">{today}</Text>
                <Title order={2} c="white" mt={6} fz={{ base: 24, md: 30 }}>
                  {greeting()}, {userName || 'Finance'} 👋
                </Title>
                <Text c="rgba(255,255,255,0.8)" mt="xs" maw={520} size="sm">
                  Ringkasan kesehatan keuangan perusahaan Anda hari ini — posisi neraca, kas, piutang, dan aktivitas jurnal terbaru.
                </Text>
                <Group mt="lg" gap="sm">
                  <Button
                    variant="white"
                    color="primary"
                    radius="xl"
                    leftSection={<IconNotebook size={16} />}
                    onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                  >
                    Buat Jurnal
                  </Button>
                  <Button
                    variant="outline"
                    radius="xl"
                    color="white"
                    style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
                    leftSection={<IconRefresh size={16} />}
                    loading={isFetching}
                    onClick={() => queryClient.invalidateQueries({ queryKey: dashboardKeys.all })}
                  >
                    Muat ulang
                  </Button>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, lg: 6 }}>
                <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm">
                  {[
                    { label: 'Total Aset', value: bs ? formatCompact(bs.totalAssets) : '—', icon: IconScale },
                    { label: 'Kewajiban', value: bs ? formatCompact(bs.totalLiabilities) : '—', icon: IconReceipt2 },
                    { label: 'Ekuitas', value: bs ? formatCompact(bs.totalEquity) : '—', icon: IconChartPie },
                  ].map((m) => (
                    <Box key={m.label} className={classes.heroChip} p="md">
                      <Group gap={6} c="rgba(255,255,255,0.75)">
                        <m.icon size={14} />
                        <Text size="xs">{m.label}</Text>
                      </Group>
                      <Text fw={800} fz={20} c="white" mt={4}>{m.value}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
                <Box className={classes.heroChip} p="sm" mt="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs" wrap="nowrap">
                      {activePeriod?.type === 'LOCK' || activePeriod?.type === 'CLOSE' ? (
                        <IconLock size={16} color="white" />
                      ) : (
                        <IconLockOpen size={16} color="white" />
                      )}
                      <Text size="sm" c="white">
                        {activePeriod
                          ? `Periode ${activePeriod.name} terkunci s.d. ${formatDate(activePeriod.endDate)}`
                          : 'Belum ada periode akuntansi yang dikunci'}
                      </Text>
                    </Group>
                    <Badge variant="white" color="primary" radius="sm">
                      {activePeriod?.type ?? 'OPEN'}
                    </Badge>
                  </Group>
                </Box>
              </Grid.Col>
            </Grid>
          </Box>

          {/* ---------- KPIs ---------- */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <KpiTile
              label="Saldo Kas & Bank"
              value={formatIDR(cash)}
              icon={IconBuildingBank}
              tone="primary"
              loading={balanceQ.isLoading}
              delay={60}
              hint="Akun kategori Kas & Bank per hari ini"
              onClick={() => navigate(routes.BankAndCash.Main)}
            />
            <KpiTile
              label="Piutang Berjalan"
              value={formatIDR(kpi.outstanding)}
              icon={IconWallet}
              tone="cyan"
              loading={salesQ.isLoading}
              delay={120}
              hint={`${kpi.openCount} faktur belum lunas`}
            />
            <KpiTile
              label="Piutang Jatuh Tempo"
              value={formatIDR(kpi.overdueAmount)}
              icon={IconAlertTriangle}
              tone={kpi.overdueCount > 0 ? 'red' : 'teal'}
              loading={salesQ.isLoading}
              delay={180}
              hint={kpi.overdueCount > 0 ? `${kpi.overdueCount} faktur melewati jatuh tempo` : 'Tidak ada tunggakan 🎉'}
            />
            <KpiTile
              label="Penjualan Bulan Ini"
              value={formatIDR(kpi.monthRevenue)}
              icon={IconCoin}
              tone="teal"
              loading={salesQ.isLoading}
              delay={240}
              hint={`${kpi.monthCount} faktur · ${kpi.draftCount} draft`}
            />
          </SimpleGrid>

          {/* ---------- Charts row ---------- */}
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <GlassCard delay={300} h="100%">
                <CardHeader
                  title="Tren Penagihan 6 Bulan"
                  subtitle="Nilai faktur terbit vs. pembayaran yang diterima"
                  right={
                    <Badge variant="light" color={kpi.collectionRate >= 80 ? 'teal' : 'orange'} size="lg" radius="md">
                      Koleksi {kpi.collectionRate.toFixed(0)}%
                    </Badge>
                  }
                />
                <SalesTrendChart data={trend} loading={salesQ.isLoading} />
              </GlassCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <GlassCard delay={360} h="100%">
                <CardHeader title="Umur Piutang" subtitle="Sisa tagihan berdasarkan keterlambatan" />
                <AgingList buckets={aging} loading={salesQ.isLoading} />
              </GlassCard>
            </Grid.Col>
          </Grid>

          {/* ---------- Composition + status ---------- */}
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, lg: 7 }}>
              <GlassCard delay={420} h="100%">
                <CardHeader
                  title="Komposisi Neraca"
                  subtitle={bs ? `Posisi per ${formatDate(bs.endDate)}` : 'Posisi aset, kewajiban, dan ekuitas'}
                  right={
                    <Button variant="subtle" size="xs" onClick={() => navigate('/result-reports')}>
                      Lihat laporan
                    </Button>
                  }
                />
                <CompositionDonut
                  loading={balanceQ.isLoading}
                  centerLabel="Total Aset"
                  centerValue={bs ? formatCompact(bs.totalAssets) : '—'}
                  slices={[
                    { label: 'Aset Lancar', value: bs?.totalCurrentAssets ?? 0, color: '#09B2FF' },
                    { label: 'Aset Tidak Lancar', value: bs?.totalNonCurrentAssets ?? 0, color: '#053079' },
                    { label: 'Kewajiban', value: bs?.totalLiabilities ?? 0, color: '#f59e0b' },
                    { label: 'Ekuitas', value: bs?.totalEquity ?? 0, color: '#14b8a6' },
                  ]}
                />
              </GlassCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <GlassCard delay={480} h="100%">
                <CardHeader title="Pusat Kontrol" subtitle="Hal yang perlu perhatian Anda" />
                <Stack gap="sm">
                  {[
                    {
                      icon: IconShieldCheck,
                      color: (pendingQ.data ?? 0) > 0 ? 'orange' : 'teal',
                      label: 'Persetujuan tertunda',
                      value: pendingQ.isLoading ? '…' : String(pendingQ.data ?? 0),
                      onClick: () => navigate(routes.pendingChanges.main),
                    },
                    {
                      icon: IconFileInvoice,
                      color: kpi.draftCount > 0 ? 'blue' : 'gray',
                      label: 'Faktur masih draft',
                      value: salesQ.isLoading ? '…' : String(kpi.draftCount),
                    },
                    {
                      icon: IconUsers,
                      color: 'violet',
                      label: 'Total kontak terdaftar',
                      value: contactsQ.isLoading ? '…' : String(contactsQ.data ?? 0),
                      onClick: () => navigate(routes.Contact.Main),
                    },
                    {
                      icon: IconCalendarStats,
                      color: activePeriod ? 'primary' : 'gray',
                      label: 'Periode aktif',
                      value: activePeriod?.name ?? '—',
                      onClick: () => navigate(routes.PeriodAndClosingBook.ListPLandCB),
                    },
                  ].map((row) => (
                    <Group
                      key={row.label}
                      justify="space-between"
                      wrap="nowrap"
                      p="sm"
                      className={classes.rowHover}
                      onClick={row.onClick}
                      style={{ border: '1px solid rgba(15,23,42,0.06)', background: 'rgba(255,255,255,0.6)' }}
                    >
                      <Group gap="sm" wrap="nowrap">
                        <Box
                          w={34}
                          h={34}
                          bg={`${row.color}.0`}
                          c={`${row.color}.7`}
                          style={{ borderRadius: 10, display: 'grid', placeItems: 'center' }}
                        >
                          <row.icon size={18} />
                        </Box>
                        <Text size="sm" c="dark.7">{row.label}</Text>
                      </Group>
                      <Text fw={800} c="dark.8">{row.value}</Text>
                    </Group>
                  ))}
                </Stack>
              </GlassCard>
            </Grid.Col>
          </Grid>

          {/* ---------- Lists ---------- */}
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <GlassCard delay={540} h="100%">
                <CardHeader
                  title="Faktur Terbaru"
                  subtitle={`${salesQ.data?.total ?? 0} faktur penjualan tercatat`}
                />
                <RecentInvoices items={recentSales} loading={salesQ.isLoading} />
              </GlassCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <GlassCard delay={600} h="100%">
                <CardHeader title="Aktivitas Jurnal" subtitle="Jejak audit perubahan terbaru" />
                <ActivityFeed
                  items={auditQ.data ?? []}
                  loading={auditQ.isLoading}
                  onOpen={(a) =>
                    a.journalId &&
                    navigate(routes.generalJournal.detailTransactionJournal.replace(':idTransaction', a.journalId))
                  }
                />
              </GlassCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <GlassCard delay={660} h="100%">
                <CardHeader title="Aksi Cepat" />
                <QuickActions
                  actions={[
                    { label: 'Jurnal Umum', icon: IconNotebook, tone: 'primary', onClick: () => navigate(routes.generalJournal.addTransactionJournal) },
                    { label: 'Terima Uang', icon: IconCoin, tone: 'teal', onClick: () => navigate(routes.BankAndCash.AddReceiveMoney) },
                    { label: 'Kirim Uang', icon: IconWallet, tone: 'orange', onClick: () => navigate(routes.BankAndCash.AddSentMoney) },
                    { label: 'Laporan', icon: IconChartPie, tone: 'violet', onClick: () => navigate('/result-reports') },
                  ]}
                />
              </GlassCard>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
    </MainDashboardLayout>
  );
}

export default MainDashboard;
