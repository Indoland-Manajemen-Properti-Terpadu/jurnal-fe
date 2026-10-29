import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
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
  IconPlus,
  IconReceipt2,
  IconRefresh,
  IconSearch,
  IconShoppingCart,
  IconX,
} from '@tabler/icons-react';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import AppShellLayout from '@/components/AppShellLayout';
import { PurchaseStatsGrid } from '@/module/purchases/presentation/components/PurchaseStatsGrid';
import { PurchaseTable } from '@/module/purchases/presentation/components/PurchaseTable';
import { CreatePurchaseModal } from '@/module/purchases/presentation/components/CreatePurchaseModal';
import { PayPurchaseModal } from '@/module/purchases/presentation/components/PayPurchaseModal';
import { usePurchases } from '@/module/purchases/presentation/hooks/usePurchases';
import { PurchaseBill } from '@/module/purchases/domain/purchase';

export function PurchasesPage() {
  const { purchases, isLoading, refetch, createPurchase, payPurchase, deletePurchase } =
    usePurchases();

  // Search & filter
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [billToPay, setBillToPay] = useState<PurchaseBill | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<PurchaseBill | null>(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    const all = purchases.length;
    const unpaid = purchases.filter((b) => b.status === 'UNPAID' || b.status === 'PARTIAL').length;
    const overdue = purchases.filter((b) => b.status === 'OVERDUE').length;
    const paid = purchases.filter((b) => b.status === 'PAID').length;
    return { all, unpaid, overdue, paid };
  }, [purchases]);

  // Filtered list
  const filteredBills = useMemo(() => {
    let result = [...purchases];

    // Status Tab Filter
    if (activeTab === 'unpaid') {
      result = result.filter((b) => b.status === 'UNPAID' || b.status === 'PARTIAL');
    } else if (activeTab === 'overdue') {
      result = result.filter((b) => b.status === 'OVERDUE');
    } else if (activeTab === 'paid') {
      result = result.filter((b) => b.status === 'PAID');
    }

    // Search query filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.billNumber.toLowerCase().includes(q) ||
          b.vendorName.toLowerCase().includes(q) ||
          (b.notes && b.notes.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      }
      if (sortBy === 'highestAmount') {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === 'highestRemaining') {
        return b.remainingAmount - a.remainingAmount;
      }
      return 0;
    });

    return result;
  }, [purchases, activeTab, debouncedSearch, sortBy]);

  const handleOpenPay = (bill: PurchaseBill) => {
    setBillToPay(bill);
    setPayModalOpen(true);
  };

  const handleDeleteRequest = (bill: PurchaseBill) => {
    setBillToDelete(bill);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (billToDelete) {
      deletePurchase(billToDelete.id, billToDelete.billNumber);
      setDeleteConfirmOpen(false);
      setBillToDelete(null);
    }
  };

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Header Module */}
          <ModuleHeader
            icon={IconShoppingCart}
            title="Pembelian & Hutang Usaha"
            description="Kelola faktur tagihan dari pemasok, jadwal jatuh tempo pembayaran, dan pelunasan hutang operasional bisnis."
            actions={
              <Group gap="sm">
                <Tooltip label="Segarkan Data">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={refetch}
                    loading={isLoading}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                <Button
                  color="primary"
                  size="sm"
                  radius="md"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Buat Tagihan Pembelian
                </Button>
              </Group>
            }
          />

          {/* Stats KPI Grid */}
          <PurchaseStatsGrid bills={purchases} loading={isLoading} />

          {/* Main Table Container */}
          <Paper withBorder radius="lg" p="md" bg="white">
            <Stack gap="md">
              {/* Filter Tabs (Consistent with Persetujuan Perubahan & Penjualan) */}
              <Tabs
                value={activeTab}
                onChange={(val) => setActiveTab(val || 'all')}
                color="primary"
                variant="pills"
                radius="md"
              >
                <Tabs.List mb="md">
                  <Tabs.Tab value="all" leftSection={<IconReceipt2 size={16} />}>
                    Semua Tagihan ({tabCounts.all})
                  </Tabs.Tab>
                  <Tabs.Tab value="unpaid" leftSection={<IconClock size={16} />}>
                    Belum Lunas ({tabCounts.unpaid})
                  </Tabs.Tab>
                  <Tabs.Tab value="overdue" leftSection={<IconAlertTriangle size={16} />}>
                    Jatuh Tempo ({tabCounts.overdue})
                  </Tabs.Tab>
                  <Tabs.Tab value="paid" leftSection={<IconCheck size={16} />}>
                    Lunas ({tabCounts.paid})
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              {/* Search & Sort Bar */}
              <Group justify="space-between" wrap="wrap" gap="sm">
                <TextInput
                  placeholder="Cari nomor faktur atau nama vendor..."
                  leftSection={<IconSearch size={16} />}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.currentTarget.value)}
                  rightSection={
                    searchInput ? (
                      <ActionIcon size="xs" variant="subtle" onClick={() => setSearchInput('')}>
                        <IconX size={12} />
                      </ActionIcon>
                    ) : null
                  }
                  w={{ base: '100%', sm: 340 }}
                />

                <Select
                  value={sortBy}
                  onChange={(val) => setSortBy(val || 'newest')}
                  data={[
                    { value: 'newest', label: 'Terbaru' },
                    { value: 'highestAmount', label: 'Tagihan Tertinggi' },
                    { value: 'highestRemaining', label: 'Sisa Hutang Terbesar' },
                  ]}
                  w={{ base: '100%', sm: 200 }}
                />
              </Group>

              {/* Table Data */}
              <PurchaseTable
                bills={filteredBills}
                loading={isLoading}
                onPay={handleOpenPay}
                onDelete={handleDeleteRequest}
                onAddNew={() => setCreateModalOpen(true)}
              />
            </Stack>
          </Paper>
        </Stack>
      </Box>

      {/* Create Purchase Modal */}
      <CreatePurchaseModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createPurchase}
      />

      {/* Pay Bill Modal */}
      <PayPurchaseModal
        opened={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        bill={billToPay}
        onSubmit={payPurchase}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        opened={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setBillToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Tagihan Pembelian"
        message={`Apakah Anda yakin ingin menghapus faktur tagihan "${billToDelete?.billNumber}" dari ${billToDelete?.vendorName}?`}
        helperText="Data tagihan dan pencatatan hutang ini akan dihapus dari sistem."
        confirmLabel="Hapus Faktur"
        cancelLabel="Batal"
      />
    </AppShellLayout>
  );
}

export default PurchasesPage;
