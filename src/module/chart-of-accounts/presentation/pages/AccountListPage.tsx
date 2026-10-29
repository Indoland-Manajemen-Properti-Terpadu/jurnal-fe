import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Group, Paper, Select, Stack, Switch, Tabs, TextInput } from '@mantine/core';
import {
  IconBuildingBank,
  IconListTree,
  IconLock,
  IconNotebook,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { ConfirmModal } from '@/components';
import { routes } from '@/router/routes';
import { useDraftAccount, BeginningBalanceModal } from '@/module/beginning-balances';
import { PeriodAndClosingBooksModal } from '@/module/period-closing';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';
import useAccountStore from '../hooks/useAccountStore';
import { useDeleteAccount } from '../hooks/useDeleteAccount';
import { SettingAccountModal } from './SettingAccountModal';
import TableAccounts from '../components/AccountTable';
import GeneralJournalLayout from './AccountListLayout';
import { useJournalAccounts } from '../hooks/useJournalAccounts';
import { countAccountStats, filterAccountsByTab } from '../../domain/accountStats';
import { AccountStatsCards } from '../components/AccountStatsCards';
import { AccountListHeaderActions } from '../components/AccountListHeaderActions';

const GeneralJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('chartOfAccounts');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { accounts, isError, isLoading, refetch } = useJournalAccounts(showArchived);
  const journalAccounts = useMemo(() => (Array.isArray(accounts) ? accounts : []), [accounts]);

  const categoryAccounts = useMemo(
    () =>
      Array.from(
        new Set(
          journalAccounts
            .map((account) => account.category?.name)
            .filter((name): name is string => Boolean(name))
        )
      ),
    [journalAccounts]
  );

  const { selectedRecords } = useAccountStore();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();
  const { draftAccounts } = useDraftAccount();

  // Modals state
  const [modals, setModals] = useState({
    beginningBalance: false,
    settingAccount: false,
    periodAndClosingBooks: false,
    deleteConfirmation: false,
  });

  const openModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  useEffect(() => {
    if (modals.beginningBalance || modals.settingAccount || modals.periodAndClosingBooks) {
      setSelectedCategory(null);
    }
  }, [modals]);

  const stats = useMemo(() => countAccountStats(journalAccounts), [journalAccounts]);

  // Filter accounts based on quick tab selection
  const dataToDisplay = useMemo(
    () => filterAccountsByTab(journalAccounts, activeTab),
    [journalAccounts, activeTab]
  );

  const handleDeleteAccount = () => {
    const ids = {
      accountIds: selectedRecords.map((item) => item.id),
    };
    deleteAccount(ids, {
      onSuccess: () => {
        closeModal('deleteConfirmation');
      },
    });
  };

  const handleButtonInitialBalance = async () => {
    if (draftAccounts?.status === false) {
      openModal('beginningBalance');
      return;
    }
    navigate(routes.generalJournal.beginningBalance);
  };

  return (
    <GeneralJournalLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Module Header - Consistent with Kontak & Produk */}
          <ModuleHeader
            icon={IconNotebook}
            title={t('list.title')}
            description={t('list.description')}
            actions={
              <AccountListHeaderActions
                isLoading={isLoading}
                onRefresh={() => refetch()}
                onOpenSettings={() => openModal('settingAccount')}
                onOpenBeginningBalance={handleButtonInitialBalance}
                onOpenPeriodLock={() => openModal('periodAndClosingBooks')}
              />
            }
          />

          <AccountStatsCards stats={stats} />

          {/* Main Content Card with Pill Tabs, Search, Filters, and Table */}
          <Paper withBorder radius="lg" p="md" bg="white">
            <Tabs
              value={activeTab}
              onChange={(val) => {
                setActiveTab(val || 'all');
              }}
              color="primary"
              variant="pills"
              radius="md"
            >
              <Tabs.List mb="md">
                <Tabs.Tab value="all" leftSection={<IconListTree size={16} />}>
                  {t('list.tabs.all', { count: stats.total })}
                </Tabs.Tab>
                <Tabs.Tab value="kas_bank" leftSection={<IconBuildingBank size={16} />}>
                  {t('list.tabs.cashBank', { count: stats.bankCash })}
                </Tabs.Tab>
                <Tabs.Tab value="locked" leftSection={<IconLock size={16} />}>
                  {t('list.tabs.locked', { count: stats.locked })}
                </Tabs.Tab>
              </Tabs.List>

              <Stack gap="md">
                {/* Search, Filter Category, & Actions Toolbar */}
                <Group justify="space-between" wrap="wrap" gap="md">
                  <Group gap="sm" wrap="wrap" style={{ flex: 1, minWidth: 280 }}>
                    <TextInput
                      placeholder={t('list.searchPlaceholder')}
                      leftSection={<IconSearch size={16} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.currentTarget.value)}
                      w={{ base: '100%', sm: 280 }}
                      radius="md"
                      size="sm"
                    />

                    <Select
                      placeholder={t('list.categoryPlaceholder')}
                      data={categoryAccounts}
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      clearable={!!selectedCategory}
                      w={{ base: '100%', sm: 220 }}
                      radius="md"
                      size="sm"
                      comboboxProps={{ width: 280, position: 'bottom-start' }}
                    />

                    <Switch
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.currentTarget.checked)}
                      label={t('list.showArchived')}
                      color="primary"
                      size="sm"
                    />
                  </Group>

                  <Group gap="xs">
                    {selectedRecords.length > 0 && (
                      <Button
                        color="red"
                        variant="light"
                        size="sm"
                        radius="md"
                        leftSection={<IconTrash size={16} />}
                        onClick={() => openModal('deleteConfirmation')}
                      >
                        {t('list.deleteSelected', { count: selectedRecords.length })}
                      </Button>
                    )}
                  </Group>
                </Group>

                {/* Table Component */}
                <TableAccounts
                  data={dataToDisplay}
                  error={isError}
                  loading={isLoading}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                />
              </Stack>
            </Tabs>
          </Paper>
        </Stack>
      </Box>

      {/* Modals Configuration */}
      <SettingAccountModal
        opened={modals.settingAccount}
        onClose={() => closeModal('settingAccount')}
        totalAccounts={journalAccounts.length}
      />
      <BeginningBalanceModal
        opened={modals.beginningBalance}
        onClose={() => closeModal('beginningBalance')}
      />
      <PeriodAndClosingBooksModal
        opened={modals.periodAndClosingBooks}
        onClose={() => closeModal('periodAndClosingBooks')}
      />
      <ConfirmModal
        opened={modals.deleteConfirmation}
        onClose={() => closeModal('deleteConfirmation')}
        onConfirm={handleDeleteAccount}
        title={t('list.deleteModal.title')}
        message={
          <>
            {t('list.deleteModal.messagePrefix')}
            <strong>{selectedRecords.length}</strong>
            {t('list.deleteModal.messageSuffix')}
          </>
        }
        helperText={t('list.deleteModal.helper')}
        imageSrc={deleteModalImage}
        confirmLabel={t('list.deleteModal.confirm')}
        cancelLabel={t('list.deleteModal.cancel')}
        confirmLoading={isDeleting}
      />
    </GeneralJournalLayout>
  );
};

export default GeneralJournalPage;
