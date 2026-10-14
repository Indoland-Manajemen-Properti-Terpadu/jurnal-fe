import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  CopyButton,
  Divider,
  Grid,
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
  Title,
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
  IconFileInvoice,
  IconInfoCircle,
  IconReceipt2,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
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

  // Count by types from currently loaded or total
  const fineCount = items.filter((it) => it.type === 'FINE').length;
  const paymentCount = items.filter((it) => it.type === 'SALE_PAYMENT').length;

  return (
    <AppShellLayout>
      <Box bg="#F8FAFC" style={{ minHeight: 'calc(100vh - 72px)' }} pb={60}>
        {/* Top Header Card */}
        <Paper
          p={{ base: 'md', sm: 'xl' }}
          radius={0}
          style={{
            borderBottom: '1px solid #E2E8F0',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          }}
        >
          <Container fluid px={{ base: 'xs', sm: 'md' }}>
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
              <Stack gap={4}>
                <Group gap="xs" align="center">
                  <ThemeIcon size={34} radius="md" color="orange" variant="light">
                    <IconShieldCheck size={20} />
                  </ThemeIcon>
                  <Title order={2} c="dark.8" fz={{ base: 20, sm: 24 }} fw={700}>
                    Pusat Persetujuan Perubahan (Pending Changes)
                  </Title>
                  {totalPending > 0 && (
                    <Badge color="orange" variant="filled" size="md">
                      {totalPending} Menunggu
                    </Badge>
                  )}
                </Group>
                <Text size="sm" c="dimmed" ml={{ sm: 44 }}>
                  Tinjau dan setujui penyesuaian invoice serta pembayaran dari aplikasi ProApps agar pembukuan akuntansi tetap sinkron.
                </Text>
              </Stack>

              <Group gap="xs">
                <Button
                  variant="default"
                  leftSection={<IconRefresh size={16} />}
                  onClick={handleRefresh}
                  loading={isLoading}
                >
                  Segarkan
                </Button>
                {items.length > 0 && (
                  <Button
                    color="teal"
                    leftSection={<IconCheck size={16} />}
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
            </Group>
          </Container>
        </Paper>

        <Container fluid px={{ base: 'md', sm: 'xl' }} mt="lg">
          <Stack gap="lg">
            {/* KPI Summary Cards */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Card withBorder padding="md" radius="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      Total Menunggu Persetujuan
                    </Text>
                    <Title order={2} fw={800} c={totalPending > 0 ? 'orange.8' : 'teal.8'} mt={4}>
                      {totalPending}
                    </Title>
                  </div>
                  <ThemeIcon size={38} radius="md" color={totalPending > 0 ? 'orange' : 'teal'} variant="light">
                    <IconClock size={20} />
                  </ThemeIcon>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  {totalPending > 0
                    ? 'Perlu persetujuan akuntan untuk memperbarui saldo faktur'
                    : 'Semua perubahan data ProApps telah disetujui & sinkron'}
                </Text>
              </Card>

              <Card withBorder padding="md" radius="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      Denda Keterlambatan (FINE)
                    </Text>
                    <Title order={2} fw={800} c="red.8" mt={4}>
                      {fineCount}
                    </Title>
                  </div>
                  <ThemeIcon size={38} radius="md" color="red" variant="light">
                    <IconAlertCircle size={20} />
                  </ThemeIcon>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  Penalti sewa/utilitas yang dihitung otomatis oleh ProApps
                </Text>
              </Card>

              <Card withBorder padding="md" radius="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      Pembayaran Masuk (SALE_PAYMENT)
                    </Text>
                    <Title order={2} fw={800} c="teal.8" mt={4}>
                      {paymentCount}
                    </Title>
                  </div>
                  <ThemeIcon size={38} radius="md" color="teal" variant="light">
                    <IconReceipt2 size={20} />
                  </ThemeIcon>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  Penerimaan dana via portal tenant / payment gateway eksternal
                </Text>
              </Card>
            </SimpleGrid>

            {/* Inbound Notice Alert */}
            <Alert icon={<IconInfoCircle size={18} />} color="blue" radius="md">
              <Text size="xs">
                <strong>Mengapa tidak ada tombol Tolak (Reject)?</strong> Perubahan data ini berasal dari kejadian operasional riil di sistem ProApps (misal penghuni membayar sewa atau denda jatuh tempo dihitung). Menolak sepihak di jurnal akan mengakibatkan ketidaksinkronan data keuangan dengan operasional properti. Tinjau rincian perubahan di bawah lalu klik <strong>Setujui</strong>.
              </Text>
            </Alert>

            {/* Filter Toolbar */}
            <Paper withBorder p="md" radius="md" bg="white">
              <Group justify="space-between" wrap="wrap" gap="md">
                <Tabs
                  value={activeTab}
                  onChange={(val) => {
                    setActiveTab(val || 'all');
                    setPage(1);
                  }}
                  variant="pills"
                  radius="md"
                >
                  <Tabs.List>
                    <Tabs.Tab value="all">Semua ({pagination.total})</Tabs.Tab>
                    <Tabs.Tab value="FINE">Denda Keterlambatan (FINE)</Tabs.Tab>
                    <Tabs.Tab value="SALE_PAYMENT">Pembayaran (SALE_PAYMENT)</Tabs.Tab>
                  </Tabs.List>
                </Tabs>

                <Group gap="xs">
                  <TextInput
                    placeholder="Cari ID faktur / referensi..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    w={{ base: '100%', sm: 240 }}
                    radius="md"
                  />
                  <Select
                    data={['10', '20', '50']}
                    value={pageSize}
                    onChange={(val) => {
                      setPageSize(val || '10');
                      setPage(1);
                    }}
                    w={80}
                    radius="md"
                  />
                </Group>
              </Group>
            </Paper>

            {/* Data Table */}
            {isLoading ? (
              <Card withBorder radius="md" p="xl" bg="white">
                <Stack gap="md">
                  <Skeleton height={40} radius="md" />
                  <Skeleton height={40} radius="md" />
                  <Skeleton height={40} radius="md" />
                </Stack>
              </Card>
            ) : items.length === 0 ? (
              <Paper withBorder p="xl" radius="md" ta="center" bg="white">
                <ThemeIcon size={52} radius="xl" color="teal" variant="light" mx="auto" mb="sm">
                  <IconSparkles size={28} />
                </ThemeIcon>
                <Title order={4} c="dark.8">
                  Semua Perubahan Data Sudah Sinkron!
                </Title>
                <Text size="sm" c="dimmed" mt={4} maw={420} mx="auto">
                  Tidak ada antrean perubahan data dari ProApps yang tertunda. Seluruh tagihan dan pembayaran telah disinkronkan ke pembukuan.
                </Text>
              </Paper>
            ) : (
              <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
                <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
                  <Table.Thead bg="gray.0">
                    <Table.Tr>
                      <Table.Th style={{ width: '15%' }}>Tipe Perubahan</Table.Th>
                      <Table.Th style={{ width: '22%' }}>Dokumen Referensi</Table.Th>
                      <Table.Th style={{ width: '38%' }}>Rincian Perubahan (Payload ProApps)</Table.Th>
                      <Table.Th style={{ width: '13%' }}>Waktu Pengajuan</Table.Th>
                      <Table.Th style={{ width: '12%', textAlign: 'center' }}>Persetujuan</Table.Th>
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
                              color="teal"
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
              </Paper>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Group justify="flex-end" mt="md">
                <Pagination
                  total={pagination.totalPages}
                  value={page}
                  onChange={setPage}
                  color="primary"
                  radius="md"
                />
              </Group>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Approve Single Modal */}
      <Modal
        opened={singleModalOpened}
        onClose={closeSingleModal}
        title={
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" color="teal" variant="light">
              <IconCheck size={16} />
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
              Apakah Anda yakin ingin menyetujui perubahan data tipe{' '}
              <strong>{selectedChange.type}</strong> ini?
            </Text>

            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  ID Referensi: <strong>{selectedChange.referenceId}</strong>
                </Text>
                {selectedChange.type === 'FINE' && (
                  <Text size="sm" fw={700} c="red.8">
                    Denda Ditambahkan: {formatIDR(selectedChange.payload?.newLateFeeAmount)}
                  </Text>
                )}
                {selectedChange.type === 'SALE_PAYMENT' && (
                  <Text size="sm" fw={700} c="teal.8">
                    Pembayaran: {formatIDR(selectedChange.payload?.amount)}
                  </Text>
                )}
              </Stack>
            </Paper>

            <Text size="xs" c="dimmed">
              Setelah disetujui, saldo tagihan invoice akan diperbarui dan penyesuaian jurnal umum terkait akan otomatis tercatat.
            </Text>

            <Divider />

            <Group justify="flex-end" gap="xs">
              <Button variant="default" onClick={closeSingleModal}>
                Batal
              </Button>
              <Button
                color="teal"
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
            <ThemeIcon size={28} radius="md" color="teal" variant="light">
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
              color="teal"
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
