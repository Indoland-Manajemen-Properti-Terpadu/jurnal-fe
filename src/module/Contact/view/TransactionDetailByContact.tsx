import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconDownload,
  IconPlus,
  IconReceipt2,
  IconRefresh,
  IconSearch,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import { routes } from '@/router/routes';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import {
  useContact,
  useContactTransactions,
  useExportContactTransactions,
} from '../hooks/useContactQueries';
import { getContactTypeBadgeConfig } from '../utils/contactFormat';
import TableTransactionByContact from '../components/Table/TableTransactionByContact';
import type { ContactType } from '../types/contact';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function TransactionDetailByContact() {
  const { idAccount } = useParams<{ idAccount: string }>();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Queries
  const { data: contact, isLoading: isContactLoading } = useContact(idAccount);
  const transactionsQuery = useContactTransactions(idAccount, {
    page: 1,
    limit: 100,
    search: debouncedSearch.trim() || undefined,
  });
  const exportMutation = useExportContactTransactions(idAccount);

  const rawTransactionsList = transactionsQuery.data?.items ?? [];

  // Filter items in client-side to guarantee accuracy for calculated states like OVERDUE and case-insensitive DRAFT
  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    return rawTransactionsList.filter((sale) => {
      const normStatus = String(sale.status || 'DRAFT').toUpperCase();
      const isOverdue =
        (sale.remainingAmount ?? 0) > 0 &&
        Boolean(sale.dueDate) &&
        new Date(sale.dueDate!).getTime() < now;

      if (activeTab === 'OVERDUE') {
        return isOverdue;
      }
      if (activeTab === 'UNPAID') {
        return (
          normStatus === 'UNPAID' ||
          normStatus === 'OPEN' ||
          normStatus === 'PARTIAL' ||
          ((sale.remainingAmount ?? 0) > 0 && normStatus !== 'DRAFT')
        );
      }
      if (activeTab === 'PAID') {
        return (
          normStatus === 'PAID' ||
          ((sale.remainingAmount ?? 0) <= 0 && (sale.paidAmount ?? 0) > 0)
        );
      }
      if (activeTab === 'DRAFT') {
        return normStatus === 'DRAFT';
      }
      return true;
    });
  }, [rawTransactionsList, activeTab]);

  const totalFiltered = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));

  const paginatedList = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredTransactions.slice(start, start + limit);
  }, [filteredTransactions, page, limit]);

  // Calculate totals for KPI summary
  const totals = useMemo(() => {
    let finalSum = 0;
    let paidSum = 0;
    let remainingSum = 0;
    rawTransactionsList.forEach((t) => {
      finalSum += t.finalAmount || 0;
      paidSum += t.paidAmount || 0;
      remainingSum += t.remainingAmount || 0;
    });
    return { finalSum, paidSum, remainingSum };
  }, [rawTransactionsList]);

  const handleTabChange = (val: string | null) => {
    setActiveTab(val ?? 'all');
    setPage(1);
  };

  const handleExport = () => {
    if (!idAccount) return;
    exportMutation.mutate();
  };

  if (isContactLoading) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={50} radius="md" />
            <Skeleton height={140} radius="lg" />
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <Skeleton height={90} radius="md" />
              <Skeleton height={90} radius="md" />
              <Skeleton height={90} radius="md" />
              <Skeleton height={90} radius="md" />
            </SimpleGrid>
            <Skeleton height={400} radius="md" />
          </Stack>
        </Box>
      </AppShellLayout>
    );
  }

  const initials = contact ? getInitials(contact.displayName) : '?';

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Top Bar Navigation & Actions */}
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'md', sm: 'lg' }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-white) 60%, var(--mantine-color-secondary-0) 100%)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={18} />}
                onClick={() =>
                  idAccount
                    ? navigate(routes.Contact.DetailContact.replace(':idAccount', idAccount))
                    : navigate(routes.Contact.Main)
                }
              >
                Kembali ke Detail Kontak
              </Button>

              <Group gap="xs">
                <Tooltip label="Muat ulang transaksi" withArrow position="top">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={() => transactionsQuery.refetch()}
                    loading={transactionsQuery.isFetching}
                    aria-label="Refresh transaksi kontak"
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                <Button
                  variant="default"
                  leftSection={<IconDownload size={16} />}
                  onClick={handleExport}
                  loading={exportMutation.isPending}
                >
                  Ekspor Transaksi
                </Button>

                <Button
                  color="primary"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => navigate(routes.sales.main)}
                >
                  Buat Faktur Penjualan
                </Button>
              </Group>
            </Group>
          </Paper>

          {/* Hero Contact Summary Banner */}
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'md', sm: 'xl' }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-white) 65%, var(--mantine-color-secondary-0) 100%)',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
              <Group gap="lg" align="flex-start">
                <Avatar
                  size={84}
                  radius="md"
                  color="primary"
                  variant="light"
                  fw={700}
                  fz={28}
                  style={{
                    border: '2px solid var(--mantine-color-gray-2)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  {initials}
                </Avatar>

                <Box>
                  <Group gap="xs" align="center" wrap="wrap">
                    <Title order={2} fz={{ base: 22, sm: 26 }} c="primary.9">
                      {contact?.displayName || 'Kontak Transaksi'}
                    </Title>
                    {contact?.contactNumber && (
                      <Badge variant="light" color="primary" size="md" ff="monospace">
                        {contact.contactNumber}
                      </Badge>
                    )}
                  </Group>

                  <Group gap="xs" mt={8} wrap="wrap">
                    {contact?.contactType && contact.contactType.length > 0 ? (
                      contact.contactType.map((t: ContactType) => {
                        const cfg = getContactTypeBadgeConfig(t);
                        return (
                          <Badge
                            key={t}
                            variant="filled"
                            color={cfg.color}
                            size="sm"
                            radius="sm"
                          >
                            {cfg.label}
                          </Badge>
                        );
                      })
                    ) : (
                      <Badge variant="outline" color="gray" size="sm">
                        Pelanggan
                      </Badge>
                    )}

                    {contact?.companyName && (
                      <Badge variant="outline" color="secondary.8" size="sm">
                        {contact.companyName}
                      </Badge>
                    )}

                    {contact?.emails && contact.emails.length > 0 && (
                      <Text size="xs" c="dimmed">
                        • {contact.emails[0]}
                      </Text>
                    )}
                  </Group>
                </Box>
              </Group>

              {/* Quick Outstanding Pill on Hero */}
              <Paper
                withBorder
                p="md"
                radius="md"
                bg="white"
                style={{
                  minWidth: 260,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  border: '1px solid var(--mantine-color-gray-2)',
                }}
              >
                <Stack gap={4} ta={{ base: 'left', sm: 'right' }}>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.5}>
                    Total Outstanding Piutang
                  </Text>
                  <Text
                    fz={24}
                    fw={800}
                    c={totals.remainingSum > 0 ? 'orange.8' : 'teal.8'}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatIDR(totals.remainingSum)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Dari {rawTransactionsList.length} total transaksi tercatat
                  </Text>
                </Stack>
              </Paper>
            </Group>
          </Paper>

          {/* Spatial KPI Metric Summary Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {/* Total Transaksi */}
            <Card withBorder radius="md" p="md" bg="white">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  Total Nilai Transaksi
                </Text>
                <ThemeIcon size={32} radius="md" variant="light" color="primary">
                  <IconReceipt2 size={18} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={800} c="primary.9" mt="xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatIDR(totals.finalSum)}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Akumulasi seluruh faktur
              </Text>
            </Card>

            {/* Total Pembayaran Diterima */}
            <Card withBorder radius="md" p="md" bg="white">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  Total Terbayar
                </Text>
                <ThemeIcon size={32} radius="md" variant="light" color="teal">
                  <IconCheck size={18} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={800} c="teal.8" mt="xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatIDR(totals.paidSum)}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Pembayaran yang telah lunas
              </Text>
            </Card>

            {/* Sisa Piutang */}
            <Card withBorder radius="md" p="md" bg={totals.remainingSum > 0 ? 'orange.0' : 'gray.0'}>
              <Group justify="space-between" align="center">
                <Text
                  size="xs"
                  fw={700}
                  c={totals.remainingSum > 0 ? 'orange.9' : 'dimmed'}
                  tt="uppercase"
                  lts={0.4}
                >
                  Sisa Piutang Belum Lunas
                </Text>
                <ThemeIcon
                  size={32}
                  radius="md"
                  variant="filled"
                  color={totals.remainingSum > 0 ? 'orange' : 'teal'}
                >
                  {totals.remainingSum > 0 ? <IconClock size={18} /> : <IconCheck size={18} />}
                </ThemeIcon>
              </Group>
              <Text
                size="xl"
                fw={800}
                c={totals.remainingSum > 0 ? 'orange.9' : 'teal.8'}
                mt="xs"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatIDR(totals.remainingSum)}
              </Text>
              <Text size="xs" c={totals.remainingSum > 0 ? 'orange.7' : 'teal.7'} mt={2}>
                {totals.remainingSum > 0 ? 'Menunggu pelunasan' : 'Semua tagihan lunas'}
              </Text>
            </Card>

            {/* Jumlah Faktur */}
            <Card withBorder radius="md" p="md" bg="white">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  Jumlah Faktur
                </Text>
                <ThemeIcon size={32} radius="md" variant="light" color="indigo">
                  <IconReceipt2 size={18} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={800} c="dark.8" mt="xs">
                {rawTransactionsList.length} Transaksi
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Total faktur tercatat di sistem
              </Text>
            </Card>
          </SimpleGrid>

          {/* Main Transactions Section with Tabs & Search */}
          <Paper withBorder radius="lg" p="md" bg="white">
            <Stack gap="md">
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                color="primary"
                variant="pills"
                radius="md"
              >
                <Group justify="space-between" align="center" wrap="wrap" gap="sm" mb="md">
                  <Tabs.List>
                    <Tabs.Tab value="all">Semua Transaksi</Tabs.Tab>
                    <Tabs.Tab value="UNPAID">Belum Lunas</Tabs.Tab>
                    <Tabs.Tab value="PAID">Lunas</Tabs.Tab>
                    <Tabs.Tab value="OVERDUE">Jatuh Tempo</Tabs.Tab>
                    <Tabs.Tab value="DRAFT">Draft</Tabs.Tab>
                  </Tabs.List>

                  <TextInput
                    placeholder="Cari nomor faktur atau produk..."
                    leftSection={<IconSearch size={16} />}
                    rightSection={
                      searchInput ? (
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={() => setSearchInput('')}
                          aria-label="Hapus pencarian"
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      ) : null
                    }
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.currentTarget.value);
                      setPage(1);
                    }}
                    w={{ base: '100%', sm: 320 }}
                  />
                </Group>

                <TableTransactionByContact
                  transactions={paginatedList}
                  isLoading={transactionsQuery.isLoading}
                  page={page}
                  limit={limit}
                  total={totalFiltered}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                />
              </Tabs>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default TransactionDetailByContact;
