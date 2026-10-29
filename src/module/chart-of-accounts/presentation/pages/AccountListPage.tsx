import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconCategory,
  IconChevronDown,
  IconDotsVertical,
  IconKey,
  IconListTree,
  IconLock,
  IconNotebook,
  IconPlus,
  IconRefresh,
  IconReportMoney,
  IconSearch,
  IconSettings,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { ConfirmModal } from '@/components';
import { routes } from '@/router/routes';
import useAccountStore from '../hooks/useAccountStore';
import { useDeleteAccount as useDeleteJurnalAccount } from '../hooks/useDeleteAccount';
import { useDraftAccount, BeginningBalanceModal } from '@/module/beginning-balances';
import { PeriodAndClosingBooksModal } from '@/module/period-closing';
import { SettingAccountModal } from './SettingAccountModal';
import TableAccounts from '../components/AccountTable';
import GeneralJournalLayout from './AccountListLayout';
import { useJournalAccounts } from '../hooks/useJournalAccounts';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';
import type { JournalAccounts } from '../../domain/journalAccount';

const GeneralJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { accounts, isError, isLoading, refetch } = useJournalAccounts(showArchived);
  const journalAccounts = useMemo(() => (Array.isArray(accounts) ? accounts : []), [accounts]);

  const categoryAccounts = useMemo(() => {
    return Array.from(
      new Set(
        journalAccounts
          .map((account) => account.category?.name)
          .filter((name): name is string => Boolean(name))
      )
    );
  }, [journalAccounts]);

  const { selectedRecords } = useAccountStore();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteJurnalAccount();
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

  // Compute metrics for overview cards
  const stats = useMemo(() => {
    let total = 0;
    let bankCash = 0;
    let locked = 0;
    const categoriesSet = new Set<string>();

    const countAccount = (acc: JournalAccounts) => {
      total += 1;
      if (acc.isBankAndCash) bankCash += 1;
      if (acc.isLocked) locked += 1;
      if (acc.category?.name) categoriesSet.add(acc.category.name);
      if (Array.isArray(acc.subAccount)) {
        acc.subAccount.forEach(countAccount);
      }
    };

    journalAccounts.forEach(countAccount);

    return {
      total,
      bankCash,
      locked,
      categoriesCount: categoriesSet.size,
    };
  }, [journalAccounts]);

  // Filter accounts based on quick tab selection
  const dataToDisplay = useMemo(() => {
    if (activeTab === 'kas_bank') {
      return journalAccounts.filter((item) => item.isBankAndCash);
    }
    if (activeTab === 'locked') {
      return journalAccounts.filter((item) => Boolean(item.isLocked));
    }
    return journalAccounts;
  }, [journalAccounts, activeTab]);

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
            title="Daftar Akun"
            description="Kelola seluruh bagan akun standar, hierarki akun induk dan sub-akun, klasifikasi kategori posisi saldo, serta kontrol penguncian buku besar akuntansi."
            actions={
              <Group gap="xs" wrap="wrap">
                <Tooltip label="Muat ulang akun" withArrow position="top">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={() => refetch()}
                    loading={isLoading}
                    aria-label="Segarkan data akun"
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                {/* Dropdown Aksi Tambahan */}
                <Menu width={240} position="bottom-end" shadow="md" radius="md" withinPortal>
                  <Menu.Target>
                    <Button
                      variant="default"
                      size="md"
                      radius="md"
                      rightSection={<IconChevronDown size={14} />}
                      leftSection={<IconDotsVertical size={16} />}
                    >
                      Aksi Lainnya
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Transaksi & Impor</Menu.Label>
                    <Menu.Item
                      leftSection={<IconPlus size={16} />}
                      onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                    >
                      Tambah Transaksi Jurnal
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconUpload size={16} />}
                      onClick={() => navigate(routes.generalJournal.bankStatementDraftImport)}
                    >
                      Impor Rekening Koran
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Label>Konfigurasi Buku Besar</Menu.Label>
                    <Menu.Item
                      leftSection={<IconSettings size={16} />}
                      onClick={() => openModal('settingAccount')}
                    >
                      Atur Akun Standar
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconReportMoney size={16} />}
                      onClick={handleButtonInitialBalance}
                    >
                      Saldo Awal (Beginning Balance)
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconKey size={16} />}
                      onClick={() => openModal('periodAndClosingBooks')}
                    >
                      Kunci Periode & Tutup Buku
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                {/* Tombol Utama Tambah Akun */}
                <Button
                  color="primary"
                  size="md"
                  radius="md"
                  leftSection={<IconPlus size={18} />}
                  onClick={() => navigate(routes.generalJournal.addAccountJournal)}
                >
                  Tambah Akun
                </Button>
              </Group>
            }
          />

          {/* Quick Metrics / Stats Cards - Follows Contact & Product Layout */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
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
                    Total Akun COA
                  </Text>
                  <Text fz={26} fw={800} c="dark.8" mt={4} lh={1.1}>
                    {stats.total.toLocaleString('id-ID')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Akun induk & sub-akun terdaftar
                  </Text>
                </div>
                <ThemeIcon size={40} radius="md" variant="light" color="primary">
                  <IconListTree size={20} />
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
                    Kas & Setara Kas
                  </Text>
                  <Text fz={26} fw={800} c="teal.8" mt={4} lh={1.1}>
                    {stats.bankCash.toLocaleString('id-ID')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Akun kas, bank, & e-wallet
                  </Text>
                </div>
                <ThemeIcon size={40} radius="md" variant="light" color="teal">
                  <IconBuildingBank size={20} />
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
                    Kategori Aktif
                  </Text>
                  <Text fz={26} fw={800} c="dark.8" mt={4} lh={1.1}>
                    {stats.categoriesCount.toLocaleString('id-ID')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Klasifikasi pos keuangan COA
                  </Text>
                </div>
                <ThemeIcon size={40} radius="md" variant="light" color="indigo">
                  <IconCategory size={20} />
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
                    Akun Terkunci
                  </Text>
                  <Text
                    fz={26}
                    fw={800}
                    c={stats.locked > 0 ? 'orange.8' : 'dark.8'}
                    mt={4}
                    lh={1.1}
                  >
                    {stats.locked.toLocaleString('id-ID')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Proteksi periode tutup buku
                  </Text>
                </div>
                <ThemeIcon
                  size={40}
                  radius="md"
                  variant="light"
                  color={stats.locked > 0 ? 'orange' : 'gray'}
                >
                  <IconLock size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </SimpleGrid>

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
                  Semua Akun ({stats.total})
                </Tabs.Tab>
                <Tabs.Tab value="kas_bank" leftSection={<IconBuildingBank size={16} />}>
                  Kas & Bank ({stats.bankCash})
                </Tabs.Tab>
                <Tabs.Tab value="locked" leftSection={<IconLock size={16} />}>
                  Akun Terkunci ({stats.locked})
                </Tabs.Tab>
              </Tabs.List>

              <Stack gap="md">
                {/* Search, Filter Category, & Actions Toolbar */}
                <Group justify="space-between" wrap="wrap" gap="md">
                  <Group gap="sm" wrap="wrap" style={{ flex: 1, minWidth: 280 }}>
                    <TextInput
                      placeholder="Cari kode atau nama akun..."
                      leftSection={<IconSearch size={16} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.currentTarget.value)}
                      w={{ base: '100%', sm: 280 }}
                      radius="md"
                      size="sm"
                    />

                    <Select
                      placeholder="Pilih Kategori Akun"
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
                      label="Lihat Diarsipkan"
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
                        Hapus Akun Terpilih ({selectedRecords.length})
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
        title="Hapus Akun Jurnal"
        message={
          <>
            Apakah Anda yakin ingin menghapus <strong>{selectedRecords.length}</strong> akun yang
            dipilih?
          </>
        }
        helperText="Data akun yang dihapus tidak dapat dipulihkan kembali."
        imageSrc={deleteModalImage}
        confirmLabel="Hapus Akun"
        cancelLabel="Batal"
        confirmLoading={isDeleting}
      />
    </GeneralJournalLayout>
  );
};

export default GeneralJournalPage;
