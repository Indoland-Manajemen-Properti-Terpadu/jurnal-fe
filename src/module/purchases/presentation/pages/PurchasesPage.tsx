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
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import AppShellLayout from '@/components/AppShellLayout';
import { PurchaseStatsGrid } from '@/module/purchases/presentation/components/PurchaseStatsGrid';
import { PurchaseTable } from '@/module/purchases/presentation/components/PurchaseTable';
import { CreatePurchaseModal } from '@/module/purchases/presentation/components/CreatePurchaseModal';
import { PayPurchaseModal } from '@/module/purchases/presentation/components/PayPurchaseModal';
import { usePurchases } from '@/module/purchases/presentation/hooks/usePurchases';
import { PurchaseBill } from '@/module/purchases/domain/purchase';
import { countByTab, filterPurchases } from '@/module/purchases/domain/purchaseFilters';
import { useTranslation } from '@/i18n';

export function PurchasesPage() {
  const { t } = useTranslation('purchases');
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

  const tabCounts = useMemo(() => countByTab(purchases), [purchases]);

  const filteredBills = useMemo(
    () => filterPurchases(purchases, { tab: activeTab, query: debouncedSearch, sortBy }),
    [purchases, activeTab, debouncedSearch, sortBy]
  );

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
            title={t('page.title')}
            description={t('page.subtitle')}
            actions={
              <Group gap="sm">
                <Tooltip label={t('page.refresh')}>
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
                  {t('page.create')}
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
                    {t('page.tabAll', { count: tabCounts.all })}
                  </Tabs.Tab>
                  <Tabs.Tab value="unpaid" leftSection={<IconClock size={16} />}>
                    {t('page.tabUnpaid', { count: tabCounts.unpaid })}
                  </Tabs.Tab>
                  <Tabs.Tab value="overdue" leftSection={<IconAlertTriangle size={16} />}>
                    {t('page.tabOverdue', { count: tabCounts.overdue })}
                  </Tabs.Tab>
                  <Tabs.Tab value="paid" leftSection={<IconCheck size={16} />}>
                    {t('page.tabPaid', { count: tabCounts.paid })}
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              {/* Search & Sort Bar */}
              <Group justify="space-between" wrap="wrap" gap="sm">
                <TextInput
                  placeholder={t('page.searchPlaceholder')}
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
                    { value: 'newest', label: t('page.sortNewest') },
                    { value: 'highestAmount', label: t('page.sortHighestAmount') },
                    { value: 'highestRemaining', label: t('page.sortHighestRemaining') },
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
        title={t('delete.title')}
        message={t('delete.message', {
          billNumber: billToDelete?.billNumber ?? '',
          vendorName: billToDelete?.vendorName ?? '',
        })}
        helperText={t('delete.helper')}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />
    </AppShellLayout>
  );
}

export default PurchasesPage;
