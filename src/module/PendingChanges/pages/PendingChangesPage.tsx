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
import { useTranslation } from '@/i18n';

const formatIDR = (val: number | string | undefined | null) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (!num || isNaN(num)) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDateTime = (dateStr: string | null | undefined, lang: string = 'id') => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', {
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

const parseChangeNotes = (notes?: string) => {
  if (!notes) return { invoiceNo: null, customerCode: null, description: null };
  const invoiceMatch = notes.match(/Invoice:\s*([^\s,;]+)/i);
  const customerMatch = notes.match(/Pelanggan:\s*([^\s,;]+)/i);

  let description = notes;
  if (invoiceMatch || customerMatch) {
    description = notes
      .replace(/Pelanggan:\s*[^\s,;]+,?\s*/i, '')
      .replace(/Invoice:\s*[^\s,;]+[\.\,]?\s*/i, '')
      .trim();
  }

  return {
    invoiceNo: invoiceMatch ? invoiceMatch[1] : null,
    customerCode: customerMatch ? customerMatch[1] : null,
    description: description || notes,
  };
};

const renderChangeDetails = (
  change: PendingChangeItem,
  t: (key: string, options?: any) => string,
  lang: string
) => {
  const payload = change.payload || {};
  const isFine = change.type === 'FINE';
  const isPayment = change.type === 'SALE_PAYMENT';
  const isDelete =
    change.type?.toUpperCase().includes('DELETE') ||
    change.type?.toUpperCase().includes('VOID') ||
    payload.action === 'DELETE' ||
    change.deleted === true;

  // 1. Denda Keterlambatan
  if (isFine) {
    const amount = payload.newLateFeeAmount ?? payload.amount;
    return (
      <Stack gap={2}>
        <Text size="sm" fw={800} c="orange.9" ff="monospace">
          +{formatIDR(amount)}
        </Text>
        <Text fz={11} c="dimmed">
          {t('lateFeeFine')}
        </Text>
      </Stack>
    );
  }

  // 2. Pembayaran Masuk
  if (isPayment) {
    return (
      <Stack gap={2}>
        <Text size="sm" fw={800} c="teal.9" ff="monospace">
          {formatIDR(payload.amount)}
        </Text>
        <Group gap={6} wrap="wrap">
          {payload.paymentMethod && (
            <Badge size="xs" variant="light" color="teal">
              {payload.paymentMethod}
            </Badge>
          )}
          {payload.transactionNumber && (
            <Text fz={11} c="dark.6">
              #{payload.transactionNumber}
            </Text>
          )}
        </Group>
      </Stack>
    );
  }

  // 3. Penghapusan / Void Faktur
  if (isDelete) {
    return (
      <Stack gap={2}>
        <Badge color="red" variant="light" size="sm" radius="sm">
          {lang === 'id' ? 'Penghapusan / Void' : 'Deletion / Void'}
        </Badge>
        {payload.originalAmount !== undefined && (
          <Text fz={11} c="dimmed" ff="monospace">
            {lang === 'id' ? 'Nilai Faktur:' : 'Invoice Amount:'}{' '}
            {formatIDR(payload.originalAmount)}
          </Text>
        )}
        {payload.reason && (
          <Text fz={11} c="dark.7" lineClamp={1}>
            {payload.reason}
          </Text>
        )}
      </Stack>
    );
  }

  // 4. Perubahan Nominal Umum
  if (
    payload.amount !== undefined ||
    payload.nominal !== undefined ||
    payload.total !== undefined
  ) {
    const val = payload.amount ?? payload.nominal ?? payload.total;
    return (
      <Stack gap={2}>
        <Text size="sm" fw={800} c="dark.8" ff="monospace">
          {formatIDR(val)}
        </Text>
        <Text fz={11} c="dimmed">
          {payload.description || payload.note || change.type}
        </Text>
      </Stack>
    );
  }

  // 5. Perubahan Non-Nominal (Status / Field Updates)
  const entries = Object.entries(payload).filter(
    ([k]) => !['syncDate', '_id', 'id', 'site', '__v', 'createdAt', 'updatedAt'].includes(k)
  );

  if (entries.length === 0) {
    return (
      <Text fz="xs" c="dimmed" fs="italic">
        —
      </Text>
    );
  }

  return (
    <Stack gap={2}>
      {entries.slice(0, 2).map(([key, val]) => (
        <Text key={key} fz={11} c="dark.7" truncate>
          <Text span fw={600} c="dimmed">
            {key}:
          </Text>{' '}
          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
        </Text>
      ))}
      {entries.length > 2 && (
        <Text fz={10} c="dimmed">
          +{entries.length - 2} field
        </Text>
      )}
    </Stack>
  );
};

export default function PendingChangesPage() {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('pendingChanges');

  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<string>('10');

  // Queries & Mutations
  const { data: countData = 0, refetch: refetchCount } = usePendingChangesCount();
  const rawCount = countData;
  const totalPending =
    typeof rawCount === 'number' ? rawCount : ((rawCount as any)?.data?.count ?? 0);

  const {
    data: changesData,
    isLoading,
    refetch: refetchList,
  } = usePendingChanges({
    page,
    limit: Number(pageSize),
    type: activeTab === 'all' ? undefined : activeTab,
    search: search.trim() || undefined,
  });

  const approveMutation = useApprovePendingChange();
  const approveAllMutation = useApproveAllPendingChanges();

  // Approve Single Confirmation Modal
  const [singleModalOpened, { open: openSingleModal, close: closeSingleModal }] =
    useDisclosure(false);
  const [selectedChange, setSelectedChange] = useState<PendingChangeItem | null>(null);

  // Approve All Confirmation Modal
  const [allModalOpened, { open: openAllModal, close: closeAllModal }] = useDisclosure(false);
  const [targetTypeForApproveAll, setTargetTypeForApproveAll] = useState<string | undefined>(
    undefined
  );

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
            title={t('title')}
            description={t('subtitle')}
            actions={
              <Group gap="xs" wrap="wrap">
                <Tooltip label={t('refreshTooltip')} withArrow position="top">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={handleRefresh}
                    loading={isLoading}
                    aria-label={t('refreshTooltip')}
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
                    {activeTab === 'all'
                      ? t('approveAll')
                      : t('approveAllWithType', { type: activeTab })}
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
                    {t('totalPending')}
                  </Text>
                  <Text
                    fz={26}
                    fw={800}
                    c={totalPending > 0 ? 'orange.8' : 'dark.8'}
                    mt={4}
                    lh={1.1}
                  >
                    {totalPending.toLocaleString(currentLanguage === 'id' ? 'id-ID' : 'en-US')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {totalPending > 0 ? t('needAccountantApproval') : t('allSynced')}
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
                    {t('lateFeeFine')}
                  </Text>
                  <Text fz={26} fw={800} c="dark.8" mt={4} lh={1.1}>
                    {fineCount.toLocaleString(currentLanguage === 'id' ? 'id-ID' : 'en-US')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {t('lateFeeDesc')}
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
                    {t('incomingPayment')}
                  </Text>
                  <Text fz={26} fw={800} c="dark.8" mt={4} lh={1.1}>
                    {paymentCount.toLocaleString(currentLanguage === 'id' ? 'id-ID' : 'en-US')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {t('incomingPaymentDesc')}
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
                  {t('tabAll')} ({pagination.total})
                </Tabs.Tab>
                <Tabs.Tab value="FINE" leftSection={<IconAlertCircle size={16} />}>
                  {t('tabFine')} ({fineCount})
                </Tabs.Tab>
                <Tabs.Tab value="SALE_PAYMENT" leftSection={<IconReceipt2 size={16} />}>
                  {t('tabPayment')} ({paymentCount})
                </Tabs.Tab>
              </Tabs.List>

              <Stack gap="md">
                {/* Search & Filter Bar */}
                <Group justify="space-between" wrap="wrap" gap="md">
                  <TextInput
                    placeholder={t('searchPlaceholder')}
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
                      {t('showRows')}
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
                    <strong>{t('whyNoRejectTitle')}</strong> {t('whyNoRejectDesc')}
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
                    title={t('emptyTitle')}
                    description={t('emptyDesc')}
                    color="teal"
                    py={48}
                  />
                ) : (
                  <Box style={{ overflowX: 'auto' }}>
                    <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                      <Table.Thead bg="gray.0">
                        <Table.Tr>
                          <Table.Th style={{ width: '26%' }}>{t('colType')}</Table.Th>
                          <Table.Th style={{ width: '32%' }}>{t('colDoc')}</Table.Th>
                          <Table.Th style={{ width: '18%' }}>{t('colPayload')}</Table.Th>
                          <Table.Th style={{ width: '12%' }}>{t('colTime')}</Table.Th>
                          <Table.Th style={{ width: '12%', textAlign: 'center' }}>
                            {t('colAction')}
                          </Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {items.map((change) => {
                          const isFine = change.type === 'FINE';
                          const isPayment = change.type === 'SALE_PAYMENT';
                          const isDelete =
                            change.type?.toUpperCase().includes('DELETE') ||
                            change.type?.toUpperCase().includes('VOID') ||
                            change.payload?.action === 'DELETE' ||
                            change.deleted === true;
                          const isApproved = change.status === 'APPROVED';
                          const { invoiceNo, customerCode, description } = parseChangeNotes(
                            change.notes
                          );

                          return (
                            <Table.Tr key={change.id}>
                              {/* Kolom 1: Transaksi / Dokumen Referensi */}
                              <Table.Td>
                                <Stack gap={4}>
                                  <Group gap={6} align="center" wrap="nowrap">
                                    <Badge
                                      color={
                                        isDelete
                                          ? 'red'
                                          : isFine
                                            ? 'orange'
                                            : isPayment
                                              ? 'teal'
                                              : 'blue'
                                      }
                                      variant="light"
                                      size="xs"
                                      radius="sm"
                                      style={{ fontWeight: 700 }}
                                    >
                                      {isDelete
                                        ? currentLanguage === 'id'
                                          ? 'Penghapusan (VOID)'
                                          : 'Deletion (VOID)'
                                        : isFine
                                          ? 'Denda (FINE)'
                                          : isPayment
                                            ? currentLanguage === 'id'
                                              ? 'Pembayaran (SALE_PAYMENT)'
                                              : 'Payment (SALE_PAYMENT)'
                                            : change.type}
                                    </Badge>

                                    {customerCode && (
                                      <Badge size="xs" variant="outline" color="gray" radius="sm">
                                        {customerCode}
                                      </Badge>
                                    )}
                                  </Group>

                                  <Group gap={6} align="center">
                                    {invoiceNo ? (
                                      <Text
                                        size="sm"
                                        fw={700}
                                        c={
                                          change.referenceModel === 'Sale' ? 'primary.7' : 'dark.8'
                                        }
                                        style={{
                                          cursor:
                                            change.referenceModel === 'Sale'
                                              ? 'pointer'
                                              : 'default',
                                          textDecoration:
                                            change.referenceModel === 'Sale' ? 'underline' : 'none',
                                          textUnderlineOffset: 2,
                                        }}
                                        onClick={() => {
                                          if (change.referenceModel === 'Sale') {
                                            navigate(`/sales/${change.referenceId}`);
                                          }
                                        }}
                                      >
                                        {invoiceNo}
                                      </Text>
                                    ) : (
                                      <Text size="sm" fw={700} c="dark.8">
                                        {change.referenceModel}
                                      </Text>
                                    )}

                                    {change.referenceModel === 'Sale' && (
                                      <Tooltip label={t('openInvoice')}>
                                        <ActionIcon
                                          size="xs"
                                          color="primary"
                                          variant="subtle"
                                          onClick={() => navigate(`/sales/${change.referenceId}`)}
                                        >
                                          <IconArrowRight size={13} />
                                        </ActionIcon>
                                      </Tooltip>
                                    )}
                                  </Group>
                                </Stack>
                              </Table.Td>

                              {/* Kolom 2: Catatan Operasional */}
                              <Table.Td>
                                {description ? (
                                  <Text size="xs" c="dark.7" lh={1.45} style={{ maxWidth: 360 }}>
                                    {description}
                                  </Text>
                                ) : (
                                  <Text size="xs" c="dimmed" fs="italic">
                                    —
                                  </Text>
                                )}
                              </Table.Td>

                              {/* Kolom 3: Detail Perubahan (Polymorphic) */}
                              <Table.Td>{renderChangeDetails(change, t, currentLanguage)}</Table.Td>

                              {/* Kolom 4: Waktu */}
                              <Table.Td>
                                <Stack gap={2}>
                                  <Text size="xs" fw={600} c="dark.8">
                                    {formatDateTime(change.createdAt, currentLanguage)}
                                  </Text>
                                  {change.updatedAt && change.updatedAt !== change.createdAt && (
                                    <Text fz={11} c="dimmed">
                                      Upd: {formatDateTime(change.updatedAt, currentLanguage)}
                                    </Text>
                                  )}
                                </Stack>
                              </Table.Td>

                              {/* Kolom 5: Aksi Persetujuan */}
                              <Table.Td style={{ textAlign: 'center' }}>
                                {isApproved ? (
                                  <Badge
                                    color="teal"
                                    variant="light"
                                    size="sm"
                                    radius="md"
                                    leftSection={<IconCheck size={12} stroke={3} />}
                                    style={{
                                      backgroundColor: '#ecfdf5',
                                      color: '#047857',
                                      border: '1px solid #a7f3d0',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {t('statusApproved')}
                                  </Badge>
                                ) : (
                                  <Button
                                    size="xs"
                                    color="primary"
                                    radius="md"
                                    leftSection={<IconCheck size={14} />}
                                    onClick={() => {
                                      setSelectedChange(change);
                                      openSingleModal();
                                    }}
                                    loading={
                                      approveMutation.isPending && selectedChange?.id === change.id
                                    }
                                  >
                                    {t('approveBtn')}
                                  </Button>
                                )}
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
                      {currentLanguage === 'id'
                        ? `Menampilkan ${(page - 1) * Number(pageSize) + 1}–${Math.min(
                            page * Number(pageSize),
                            pagination.total
                          )} dari ${pagination.total} data`
                        : `Showing ${(page - 1) * Number(pageSize) + 1}–${Math.min(
                            page * Number(pageSize),
                            pagination.total
                          )} of ${pagination.total} entries`}
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
              <IconCheck size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              {t('singleModalTitle')}
            </Text>
          </Group>
        }
        radius="md"
      >
        {selectedChange && (
          <Stack gap="md">
            <Text size="sm">{t('singleModalPrompt')}</Text>

            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t('typeLabel')}
                  </Text>
                  <Badge size="sm" color={selectedChange.type === 'FINE' ? 'red' : 'teal'}>
                    {selectedChange.type}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t('targetDocLabel')}
                  </Text>
                  <Text size="xs" fw={600}>
                    {selectedChange.referenceModel}
                  </Text>
                </Group>
                {selectedChange.type === 'FINE' && (
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {t('fineAmountLabel')}
                    </Text>
                    <Text size="xs" fw={700} c="red.8">
                      +{formatIDR(selectedChange.payload?.newLateFeeAmount)}
                    </Text>
                  </Group>
                )}
                {selectedChange.type === 'SALE_PAYMENT' && (
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {t('paymentAmountLabel')}
                    </Text>
                    <Text size="xs" fw={700} c="teal.9">
                      {formatIDR(selectedChange.payload?.amount)}
                    </Text>
                  </Group>
                )}
                {selectedChange.notes && (
                  <Group justify="space-between" align="flex-start">
                    <Text size="xs" c="dimmed">
                      {t('notesLabel')}
                    </Text>
                    <Text size="xs" fw={600} style={{ maxWidth: '75%', textAlign: 'right' }}>
                      {selectedChange.notes}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Paper>

            <Alert icon={<IconAlertTriangle size={16} />} color="orange" radius="md">
              {t('singleModalAlert')}
            </Alert>

            <Divider />

            <Group justify="flex-end" gap="xs">
              <Button variant="default" onClick={closeSingleModal}>
                {t('cancel')}
              </Button>
              <Button
                color="primary"
                leftSection={<IconCheck size={16} />}
                onClick={handleConfirmApproveSingle}
                loading={approveMutation.isPending}
              >
                {t('confirmApproveSingle')}
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
              {t('allModalTitle')}
            </Text>
          </Group>
        }
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm">
            {currentLanguage === 'id' ? (
              <>
                Apakah Anda yakin ingin menyetujui <strong>semua</strong> perubahan data{' '}
                {targetTypeForApproveAll ? (
                  <Badge color="orange" size="sm">
                    {targetTypeForApproveAll}
                  </Badge>
                ) : (
                  'yang saat ini berstatus PENDING'
                )}
                ?
              </>
            ) : (
              <>
                Are you sure you want to approve <strong>all</strong> changes{' '}
                {targetTypeForApproveAll ? (
                  <Badge color="orange" size="sm">
                    {targetTypeForApproveAll}
                  </Badge>
                ) : (
                  'currently marked as PENDING'
                )}
                ?
              </>
            )}
          </Text>

          <Alert icon={<IconAlertTriangle size={16} />} color="orange" radius="md">
            {t('allModalAlert')}
          </Alert>

          <Divider />

          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={closeAllModal}>
              {t('cancel')}
            </Button>
            <Button
              color="primary"
              leftSection={<IconCheck size={16} />}
              onClick={handleConfirmApproveAll}
              loading={approveAllMutation.isPending}
            >
              {t('confirmApproveAll')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShellLayout>
  );
}
