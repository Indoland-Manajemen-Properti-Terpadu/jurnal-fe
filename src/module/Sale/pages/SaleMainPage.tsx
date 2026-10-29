import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Tabs,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconFileText,
  IconPlus,
  IconReceipt2,
  IconRefresh,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { CreateSaleModal } from '../components/CreateSaleModal';
import { PaySaleModal } from '../components/PaySaleModal';
import { SaleStatsGrid } from '../components/SaleStatsGrid';
import { SaleTable } from '../components/SaleTable';
import {
  useCreateSale,
  useCreateSalePayment,
  useDownloadInvoicePdf,
  useGenerateInvoiceLink,
  useSales,
} from '../hooks/useSaleQueries';
import type { CreateSaleFormValues, CreateSalePaymentPayload, Sale } from '../types/sale';

export function SaleMainPage() {
  const navigate = useNavigate();

  // State filters & pagination
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [payModalOpened, setPayModalOpened] = useState(false);
  const [selectedSaleForPay, setSelectedSaleForPay] = useState<Sale | null>(null);

  // Query: if tab is OVERDUE, do not pass OVERDUE as status to API (since API only accepts real status strings or none)
  const apiStatusParam = useMemo(() => {
    if (activeTab === 'all' || activeTab === 'OVERDUE') return undefined;
    return activeTab;
  }, [activeTab]);

  // Queries
  const salesQuery = useSales({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    status: apiStatusParam,
  });

  // Mutations
  const createMutation = useCreateSale();
  const payMutation = useCreateSalePayment(selectedSaleForPay?.id);
  const generateLinkMutation = useGenerateInvoiceLink();
  const downloadPdfMutation = useDownloadInvoicePdf();

  const rawSalesList = salesQuery.data?.items || [];
  const pagination = salesQuery.data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  // Filter items in client-side to guarantee accuracy for calculated states like OVERDUE or case-insensitive DRAFT
  const salesList = useMemo(() => {
    const now = Date.now();
    return rawSalesList.filter((sale) => {
      const normStatus = String(sale.status || 'DRAFT').toUpperCase();
      if (activeTab === 'OVERDUE') {
        const isOverdue =
          sale.remainingAmount > 0 &&
          sale.dueDate &&
          new Date(sale.dueDate).getTime() < now;
        return isOverdue;
      }
      if (activeTab === 'UNPAID') {
        return normStatus === 'UNPAID' || normStatus === 'OPEN' || normStatus === 'PARTIAL' || (sale.remainingAmount > 0 && normStatus !== 'DRAFT');
      }
      if (activeTab === 'PAID') {
        return normStatus === 'PAID' || (sale.remainingAmount <= 0 && sale.paidAmount > 0);
      }
      if (activeTab === 'DRAFT') {
        return normStatus === 'DRAFT';
      }
      return true;
    });
  }, [rawSalesList, activeTab]);

  // Aggregate stats from current items
  const stats = useMemo(() => {
    let totalAmt = 0;
    let paidAmt = 0;
    let remainingAmt = 0;
    let overdue = 0;

    const now = Date.now();
    rawSalesList.forEach((s) => {
      totalAmt += s.finalAmount || 0;
      paidAmt += s.paidAmount || 0;
      remainingAmt += s.remainingAmount || 0;
      if (s.remainingAmount > 0 && s.dueDate && new Date(s.dueDate).getTime() < now) {
        overdue += 1;
      }
    });

    return {
      totalCount: total,
      totalAmount: totalAmt,
      paidAmount: paidAmt,
      remainingAmount: remainingAmt,
      overdueCount: overdue,
    };
  }, [rawSalesList, total]);

  const handleTabChange = (val: string | null) => {
    setActiveTab(val || 'all');
    setPage(1);
  };

  const handleViewDetail = (sale: Sale) => {
    navigate(`/sales/${sale.id}`);
  };

  const handleOpenPay = (sale: Sale) => {
    setSelectedSaleForPay(sale);
    setPayModalOpened(true);
  };

  const handleCreateSubmit = async (values: CreateSaleFormValues) => {
    await createMutation.mutateAsync(values);
    setCreateModalOpened(false);
  };

  const handlePaySubmit = async (payload: CreateSalePaymentPayload) => {
    await payMutation.mutateAsync(payload);
    setPayModalOpened(false);
    setSelectedSaleForPay(null);
  };

  const handleGenerateLink = async (sale: Sale) => {
    await generateLinkMutation.mutateAsync(sale.id);
  };

  const handleDownloadPdf = async (sale: Sale) => {
    await downloadPdfMutation.mutateAsync({
      id: sale.id,
      filename: `Faktur-${sale.transactionNumber.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
    });
  };

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Header */}
          <ModuleHeader
            icon={IconReceipt2}
            title="Daftar Penjualan & Faktur"
            description="Kelola seluruh tagihan penjualan, invoice ke pelanggan/unit properti, catat penerimaan kas, dan pantau status jatuh tempo pembayaran secara akurat."
            actions={
              <Group gap="xs">
                <Tooltip label="Muat ulang data" withArrow>
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={() => salesQuery.refetch()}
                    loading={salesQuery.isFetching}
                    aria-label="Refresh penjualan"
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                <Button
                  color="primary"
                  leftSection={<IconPlus size={18} />}
                  onClick={() => setCreateModalOpened(true)}
                >
                  Buat Penjualan
                </Button>
              </Group>
            }
          />

          {/* KPI Stats Grid */}
          <SaleStatsGrid
            totalCount={stats.totalCount}
            totalAmount={stats.totalAmount}
            paidAmount={stats.paidAmount}
            remainingAmount={stats.remainingAmount}
            overdueCount={stats.overdueCount}
          />

          {/* Main Table Tabs */}
          <Paper withBorder radius="lg" p="md" bg="white">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              color="primary"
              variant="pills"
              radius="md"
            >
              <Tabs.List mb="md">
                <Tabs.Tab value="all" leftSection={<IconReceipt2 size={16} />}>
                  Semua Penjualan
                </Tabs.Tab>
                <Tabs.Tab value="UNPAID" leftSection={<IconClock size={16} />}>
                  Belum Lunas
                </Tabs.Tab>
                <Tabs.Tab value="PAID" leftSection={<IconCheck size={16} />}>
                  Lunas
                </Tabs.Tab>
                <Tabs.Tab value="DRAFT" leftSection={<IconFileText size={16} />}>
                  Draft
                </Tabs.Tab>
                <Tabs.Tab value="OVERDUE" leftSection={<IconAlertTriangle size={16} />}>
                  Jatuh Tempo
                </Tabs.Tab>
              </Tabs.List>

              <Stack gap="md">
                {/* Search & Filter Bar */}
                <Group justify="space-between" wrap="wrap" gap="sm">
                  <TextInput
                    placeholder="Cari nomor transaksi, pelanggan, atau referensi..."
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
                    w={{ base: '100%', sm: 380 }}
                  />
                </Group>

                {/* Table with Loading Overlay */}
                <Box pos="relative">
                  <LoadingOverlay
                    visible={salesQuery.isFetching && !salesQuery.isLoading}
                    overlayProps={{ blur: 1 }}
                  />
                  <SaleTable
                    sales={salesList}
                    isLoading={salesQuery.isLoading}
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={(newLimit) => {
                      setLimit(newLimit);
                      setPage(1);
                    }}
                    onViewDetail={handleViewDetail}
                    onPaySale={handleOpenPay}
                    onGenerateLink={handleGenerateLink}
                    onDownloadPdf={handleDownloadPdf}
                    onCreateNew={() => setCreateModalOpened(true)}
                  />
                </Box>
              </Stack>
            </Tabs>
          </Paper>
        </Stack>
      </Box>

      {/* Create Sale Modal */}
      <CreateSaleModal
        opened={createModalOpened}
        isSubmitting={createMutation.isPending}
        onClose={() => setCreateModalOpened(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Pay Sale Modal */}
      <PaySaleModal
        opened={payModalOpened}
        sale={selectedSaleForPay}
        isSubmitting={payMutation.isPending}
        onClose={() => {
          setPayModalOpened(false);
          setSelectedSaleForPay(null);
        }}
        onSubmit={handlePaySubmit}
      />
    </AppShellLayout>
  );
}

export default SaleMainPage;

