import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  CopyButton,
  Divider,
  Group,
  Modal,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconCoin,
  IconCopy,
  IconInfoCircle,
  IconReceipt2,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import EmptyState from '@/components/EmptyState/EmptyState';
import {
  useApproveAllPendingChanges,
  useApprovePendingChange,
  usePendingChanges,
  usePendingChangesCount,
} from '../hooks/usePendingChangesQueries';
import type { PendingChangeItem } from '../types/pendingChange';

const formatIDR = (val: number | string | undefined | null) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (!num || isNaN(num)) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export default function PendingChangesPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<string>('10');

  // Queries & Mutations
  const { data: countData = 0, refetch: refetchCount } = usePendingChangesCount();
  const rawCount = countData;
  const totalPending = typeof rawCount === 'number' ? rawCount : (rawCount as any)?.data?.count ?? 0;

  const { data: changesData, isLoading, refetch: refetchList } = usePendingChanges({
    page,
    limit: Number(pageSize),
    type: activeTab === 'all' ? undefined : activeTab,
    search: search.trim() || undefined,
  });

  const approveMutation = useApprovePendingChange();
  const approveAllMutation = useApproveAllPendingChanges();

  // Approve Single Confirmation Modal
  const [singleModalOpened, { open: openSingleModal, close: closeSingleModal }] = useDisclosure(false);
  const [selectedChange, setSelectedChange] = useState<PendingChangeItem | null>(null);

  // Approve All Confirmation Modal
  const [allModalOpened, { open: openAllModal, close: closeAllModal }] = useDisclosure(false);
  const [targetTypeForApproveAll, setTargetTypeForApproveAll] = useState<string | undefined>(undefined);

  const handleRefresh = () => {
    refetchCount();
    refetchList();
  };

  const handleConfirmApproveSingle = async () => {
    if (!selectedChange) return;
    await approveMutation.mutateAsync(selectedChange.id);
    closeSingleModal();
    setSelectedChange(null);
  };

  const handleConfirmApproveAll = async () => {
    await approveAllMutation.mutateAsync(targetTypeForApproveAll);
    closeAllModal();
  };

  const items = changesData?.data || [];
  const pagination = changesData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Count by types from currently loaded items
  const fineCount = items.filter((it) => it.type === 'FINE').length;
  const paymentCount = items.filter((it) => it.type === 'SALE_PAYMENT').length;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Module Header - Consistent with Kontak & Produk */}
          <ModuleHeader
            icon={IconShieldCheck}
            title="Pusat Persetujuan Perubahan (Pending Changes)"
            description="Tinjau dan setujui penyesuaian invoice serta pembayaran dari aplikasi ProApps agar pembukuan akuntansi tetap sinkron."
            actions={
              <Group gap="xs" wrap="wrap">
                <Tooltip label="Muat ulang antrean" withArrow position="top">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={handleRefresh}
                    loading={isLoading}
                    aria-label="Segarkan data"
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                {items.length > 0 && (
                  <Button
                    color="primary"
                    leftSection={<IconCheck size={18} />}
                    onClick={() => {
                      setTargetTypeForApproveAll(activeTab === 'all' ? undefined : activeTab);
                      openAllModal();
                    }}
                    loading={approveAllMutation.isPending}
                  >
                    Setujui Semua {activeTab !== 'all' ? `(${activeTab})` : ''}
                  </Button>
                )}
              </Group>
            }
          />

          {/* Quick Metrics / Stats Cards - Consistent with ContactStatsGrid & ProductsPage */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Paper
              withBorder
              radius="md"
              p="md"
              bg="white"
              style={{ transition: 'transform 150ms ease, box-shadow 150ms ease' }}
            >
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    Total Menunggu Persetujuan
                  </Text>
                  <Text fz={26} fw={800} c={totalPending > 0 ? 'orange.8' : 'dark.8'} mt={4} lh={1.1}>
                    {totalPending.toLocaleString('id-ID')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {totalPending > 0
                      ? 'Perlu persetujuan akuntan'
                      : 'Semua perubahan data telah sinkron'}
                  </Text>
                </div>
                <ThemeIcon
                  size={40}
                  radius="md"
                  variant="light"
                  color={totalPending > 0 ? 'orange' : 'teal'}
                >
                  <IconClock size={20} />
                </ThemeIcon>
              </Group>
            </Paper>

            <Paper
              withBorder
              radius="md"
              p="md"
              bg="white"
              style={{ transition: 'transform 150ms ease, box-shadow 150ms ease' }}
            >
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    Denda Keterlambatan (FINE)
                  </Text>
                  <Text fz={26} fw={800} c="dark.8" mt={4} lh={1.1}>
                    {fineCount.toLocaleString('id-ID')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Penalti sewa & utilitas ProApps
                  </Text>
                </div>
                <ThemeIcon size={40} radius="md" variant="light" color="red">
                  <IconAlertCircle size={20} />
                </ThemeIcon>
              </Group>
            </Paper>

            <Paper
              withBorder
              radius="md"
              p="md"
              bg="white"
              style={{ transition: 'transform 150ms ease, box-shadow 150ms ease' }}
            >
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    Pembayaran Masuk (SALE_PAYMENT)
                  </Text>
                  <Text fz={26} fw={800} c="dark.8" mt={4} lh={1.1}>
                    {paymentCount.toLocaleString('id-ID')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Penerimaan via tenant portal / gateway
                  </Text>
                </div>
                <ThemeIcon size={40} radius="md" variant="light" color="teal">
                  <IconReceipt2 size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </SimpleGrid>

          {/* Main Content Card with Pill Tabs, Search, Alert, and Table */}
          <Paper withBorder radius="lg" p="md" bg="white">
            <Tabs
              value={activeTab}
              onChange={(val) => {
                setActiveTab(val || 'all');
                setPage(1);
              }}
              color="primary"
              variant="pills"
              radius="md"
            >
              <Tabs.List mb="md">
                <Tabs.Tab value="all" leftSection={<IconShieldCheck size={16} />}>
                  Semua Perubahan ({pagination.total})
                </Tabs.Tab>
                <Tabs.Tab value="FINE" leftSection={<IconAlertCircle size={16} />}>
                  Denda Keterlambatan ({fineCount})
                </Tabs.Tab>
                <Tabs.Tab value="SALE_PAYMENT" leftSection={<IconReceipt2 size={16} />}>
                  Pembayaran ({paymentCount})
                </Tabs.Tab>
              </Tabs.List>

              <Stack gap="md">
                {/* Search & Filter Bar */}
                <Group justify="space-between" wrap="wrap" gap="md">
                  <TextInput
                    placeholder="Cari ID faktur / referensi..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.currentTarget.value);
                      setPage(1);
                    }}
                    w={{ base: '100%', sm: 280 }}
                    radius="md"
                    size="sm"
                  />

                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      Tampilkan:
                    </Text>
                    <Select
                      data={['10', '25', '50']}
                      value={pageSize}
                      onChange={(val) => {
                        setPageSize(val || '10');
                        setPage(1);
                      }}
                      w={90}
                      radius="md"
                      size="sm"
                    />
                  </Group>
                </Group>

                {/* Inbound Notice Alert */}
                <Alert icon={<IconInfoCircle size={18} />} color="blue" radius="md" variant="light">
                  <Text size="xs" lh={1.5}>
                    <strong>Mengapa tidak ada tombol Tolak (Reject)?</strong> Perubahan data ini berasal dari kejadian operasional riil di sistem ProApps (misal penghuni membayar sewa atau denda jatuh tempo dihitung). Menolak sepihak di jurnal akan mengakibatkan ketidaksinkronan data keuangan dengan operasional properti. Tinjau rincian perubahan di bawah lalu klik <strong>Setujui</strong>.
                  </Text>
                </Alert>

                {/* Data Table */}
                {isLoading ? (
                  <Stack gap="md" py="xl">
                    <Skeleton height={44} radius="md" />
                    <Skeleton height={44} radius="md" />
                    <Skeleton height={44} radius="md" />
                  </Stack>
                ) : items.length === 0 ? (
                  <EmptyState
                    icon={<IconShieldCheck size={32} stroke={1.6} />}
                    title="Semua Perubahan Data Sudah Sinkron!"
                    description="Tidak ada antrean perubahan data dari ProApps yang tertunda. Seluruh tagihan dan pembayaran telah disinkronkan ke pembukuan."
                    color="teal"
                    py={48}
                  />
                ) : (
                  <Box style={{ overflowX: 'auto' }}>
                    <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
                      <Table.Thead bg="gray.0">
                        <Table.Tr>
                          <Table.Th style={{ width: '15%' }}>TIPE PERUBAHAN</Table.Th>
                          <Table.Th style={{ width: '22%' }}>DOKUMEN REFERENSI</Table.Th>
                          <Table.Th style={{ width: '38%' }}>RINCIAN PERUBAHAN (PAYLOAD PROAPPS)</Table.Th>
                          <Table.Th style={{ width: '13%' }}>WAKTU PENGAJUAN</Table.Th>
                          <Table.Th style={{ width: '12%', textAlign: 'center' }}>PERSETUJUAN</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {items.map((change) => {
                          const isFine = change.type === 'FINE';
                          const isPayment = change.type === 'SALE_PAYMENT';
                          const payload = change.payload || {};

                          return (
                            <Table.Tr key={change.id}>
                              <Table.Td>
                                <Stack gap={4} align="flex-start">
                                  <Badge
                                    color={isFine ? 'red' : isPayment ? 'teal' : 'blue'}
                                    variant="light"
                                    size="md"
                                  >
                                    {isFine ? 'Denda (FINE)' : isPayment ? 'Pembayaran' : change.type}
                                  </Badge>
                                  <Badge color="orange" variant="dot" size="xs">
                                    {change.status}
                                  </Badge>
                                </Stack>
                              </Table.Td>

                              <Table.Td>
                                <Stack gap={2}>
                                  <Group gap={4}>
                                    <Text size="xs" fw={700} c="dark.8">
                                      {change.referenceModel}
                                    </Text>
                                    <CopyButton value={change.referenceId} timeout={2000}>
                                      {({ copied, copy }) => (
                                        <Tooltip label={copied ? 'Tersalin' : 'Salin ID'}>
                                          <ActionIcon size="xs" color="gray" variant="subtle" onClick={copy}>
                                            <IconCopy size={12} />
                                          </ActionIcon>
                                        </Tooltip>
                                      )}
                                    </CopyButton>
                                  </Group>

                                  <Text size="xs" c="dimmed" ff="monospace" lineClamp={1}>
                                    {change.referenceId}
                                  </Text>

                                  {change.referenceModel === 'Sale' && (
                                    <Button
                                      variant="subtle"
                                      color="primary"
                                      size="compact-xs"
                                      p={0}
                                      justify="flex-start"
                                      rightSection={<IconArrowRight size={12} />}
                                      onClick={() => navigate(`/sales/${change.referenceId}`)}
                                    >
                                      Buka Faktur
                                    </Button>
                                  )}
                                </Stack>
                              </Table.Td>

                              <Table.Td>
                                {isFine && (
                                  <Paper withBorder p="xs" radius="sm" bg="red.0">
                                    <Group justify="space-between" align="center">
                                      <div>
                                        <Text size="xs" c="dimmed">
                                          Penambahan Nilai Denda:
                                        </Text>
                                        <Text size="sm" fw={700} c="red.8" ff="monospace">
                                          +{formatIDR(payload.newLateFeeAmount)}
                                        </Text>
                                      </div>
                                      {payload.syncDate && (
                                        <Text size="xs" c="dimmed">
                                          Sync: {formatDateTime(payload.syncDate)}
                                        </Text>
                                      )}
                                    </Group>
                                  </Paper>
                                )}

                                {isPayment && (
                                  <Paper withBorder p="xs" radius="sm" bg="teal.0">
                                    <Stack gap={2}>
                                      <Group justify="space-between">
                                        <Text size="xs" c="dimmed">
                                          Nominal Pembayaran Masuk:
                                        </Text>
                                        <Text size="sm" fw={700} c="teal.9" ff="monospace">
                                          {formatIDR(payload.amount)}
                                        </Text>
                                      </Group>
                                      {payload.transactionNumber && (
                                        <Text size="xs" c="dark.7">
                                          No. Bukti: <strong>{payload.transactionNumber}</strong>
                                        </Text>
                                      )}
                                      {payload.paymentDate && (
                                        <Text size="xs" c="dimmed">
                                          Tgl Bayar: {formatDateTime(payload.paymentDate)}
                                        </Text>
                                      )}
                                    </Stack>
                                  </Paper>
                                )}

                                {!isFine && !isPayment && (
                                  <Text size="xs" ff="monospace" c="dark.7">
                                    {JSON.stringify(payload)}
                                  </Text>
                                )}
                              </Table.Td>

                              <Table.Td>
                                <Text size="xs" c="dark.8">
                                  {formatDateTime(change.createdAt)}
                                </Text>
                              </Table.Td>

                              <Table.Td style={{ textAlign: 'center' }}>
                                <Button
                                  size="xs"
                                  color="primary"
                                  leftSection={<IconCheck size={14} />}
                                  onClick={() => {
                                    setSelectedChange(change);
                                    openSingleModal();
                                  }}
                                  loading={approveMutation.isPending && selectedChange?.id === change.id}
                                >
                                  Setujui
                                </Button>
                              </Table.Td>
                            </Table.Tr>
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  </Box>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <Group justify="space-between" mt="md" wrap="wrap">
                    <Text size="xs" c="dimmed">
                      Menampilkan {(page - 1) * Number(pageSize) + 1}–
                      {Math.min(page * Number(pageSize), pagination.total)} dari {pagination.total} data
                    </Text>
                    <Pagination
                      total={pagination.totalPages}
                      value={page}
                      onChange={setPage}
                      size="sm"
                      radius="md"
                      color="primary"
                    />
                  </Group>
                )}
              </Stack>
            </Tabs>
          </Paper>
        </Stack>
      </Box>

      {/* Approve Single Confirmation Modal */}
      <Modal
        opened={singleModalOpened}
        onClose={closeSingleModal}
        title={
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" color="primary" variant="light">
              <IconShieldCheck size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              Konfirmasi Persetujuan Perubahan
            </Text>
          </Group>
        }
        radius="md"
      >
        {selectedChange && (
          <Stack gap="md">
            <Text size="sm">
              Apakah Anda yakin ingin menyetujui perubahan berikut ke dalam sistem pembukuan akuntansi?
            </Text>

            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Tipe:
                  </Text>
                  <Badge size="sm" color={selectedChange.type === 'FINE' ? 'red' : 'teal'}>
                    {selectedChange.type}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Target Dokumen:
                  </Text>
                  <Text size="xs" fw={600}>
                    {selectedChange.referenceModel}
                  </Text>
                </Group>
                {selectedChange.type === 'FINE' && (
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Nominal Denda:
                    </Text>
                    <Text size="xs" fw={700} c="red.8">
                      +{formatIDR(selectedChange.payload?.newLateFeeAmount)}
                    </Text>
                  </Group>
                )}
                {selectedChange.type === 'SALE_PAYMENT' && (
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Nominal Bayar:
                    </Text>
                    <Text size="xs" fw={700} c="teal.9">
                      {formatIDR(selectedChange.payload?.amount)}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Paper>

            <Alert icon={<IconAlertTriangle size={16} />} color="orange" radius="md">
              Setelah disetujui, perubahan ini langsung diperbarui di saldo faktur dan jurnal pembukuan.
            </Alert>

            <Divider />

            <Group justify="flex-end" gap="xs">
              <Button variant="default" onClick={closeSingleModal}>
                Batal
              </Button>
              <Button
                color="primary"
                leftSection={<IconCheck size={16} />}
                onClick={handleConfirmApproveSingle}
                loading={approveMutation.isPending}
              >
                Ya, Setujui Perubahan
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Approve All Confirmation Modal */}
      <Modal
        opened={allModalOpened}
        onClose={closeAllModal}
        title={
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" color="primary" variant="light">
              <IconSparkles size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              Persetujuan Perubahan Massal
            </Text>
          </Group>
        }
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menyetujui <strong>semua</strong> perubahan data{' '}
            {targetTypeForApproveAll ? (
              <Badge color="orange" size="sm">
                {targetTypeForApproveAll}
              </Badge>
            ) : (
              'yang saat ini berstatus PENDING'
            )}
            ?
          </Text>

          <Alert icon={<IconAlertTriangle size={16} />} color="orange" radius="md">
            Seluruh invoice terkait akan diperbarui secara serentak sesuai angka penyesuaian dari ProApps.
          </Alert>

          <Divider />

          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={closeAllModal}>
              Batal
            </Button>
            <Button
              color="primary"
              leftSection={<IconCheck size={16} />}
              onClick={handleConfirmApproveAll}
              loading={approveAllMutation.isPending}
            >
              Ya, Setujui Semua
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShellLayout>
  );
}
