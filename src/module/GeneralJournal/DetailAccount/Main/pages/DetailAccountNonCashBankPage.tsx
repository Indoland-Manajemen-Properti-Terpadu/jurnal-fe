import React, { useMemo, useState } from 'react';
import {
  Container,
  Group,
  Paper,
  Stack,
  Button,
  Text,
  SimpleGrid,
  Loader,
  Center,
  Menu,
  Badge,
  ActionIcon,
  ThemeIcon,
  Tabs,
  TextInput,
  Tooltip,
  Divider,
  Title,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePickerInput } from '@mantine/dates';
import {
  IconSearch,
  IconTrash,
  IconPlus,
  IconCalendar,
  IconPencil,
  IconArchive,
  IconDotsVertical,
  IconArrowLeft,
  IconNotebook,
  IconScale,
  IconArrowDownRight,
  IconArrowUpRight,
  IconReceipt2,
  IconInfoCircle,
  IconRefresh,
  IconX,
  IconLock,
  IconBookmarks,
  IconCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';

import DetailAccountLayout from './Layout';
import TableJournalTransaction from '../../TransactionJournal/components/TableTransactionJournal/JournalTransactionTable';
import { useDetailAccount } from '../hooks/useDetailAccount';
import { accountDetailData } from '../types/DetailAccountModel';
import { routes } from '@/router/routes';
import { TransactionByAccountModel } from '../../TransactionJournal/types/TransactionByAccountModel';
import { GetTransactionByAccount } from '../../TransactionJournal/services/TransactionByAccount.service';
import { DeleteTransactionAccounts } from '../../TransactionJournal/services/DeleteTransactionAccount.service';
import { JournalEmptyState } from '@/components/EmptyState/JournalEmptyState';
import { archiveAccount } from '../services/DetailAccount.service';
import { useDeleteJurnalAccount } from '@/module/GeneralJournal/JournalAccount/services';
import { ConfirmModal } from '@/components';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { formatCurrency } from '@/utils/FormatCurrency';
import useFilterTransaction from '../store/FilterTransaction';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';
import arsipkanIcon from '@/assets/img/vectors/arsipkan.svg';

/** Helper to determine the normal accounting balance (Debit vs Kredit) */
export function getNormalBalance(categoryName?: string, type?: string): 'Debit' | 'Kredit' {
  const cat = (categoryName || type || '').toLowerCase();
  if (
    cat.includes('kewajiban') ||
    cat.includes('hutang') ||
    cat.includes('liabilitas') ||
    cat.includes('modal') ||
    cat.includes('ekuitas') ||
    cat.includes('pendapatan') ||
    cat.includes('penjualan')
  ) {
    return 'Kredit';
  }
  return 'Debit';
}

const DetailAccountNonCashBank: React.FC = () => {
  const navigate = useNavigate();
  const { idAccount } = useParams<{ idAccount: string }>();
  const queryClient = useQueryClient();

  const { accountDetail, isLoading: isLoadingAccount } = useDetailAccount(idAccount!);
  const {
    data: transactions,
    isLoading: isLoadingTransaction,
    refetch: refetchTransactions,
  } = GetTransactionByAccount(idAccount!);

  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteJurnalAccount();
  const deleteTransactionMutation = DeleteTransactionAccounts();

  const rawData =
    (accountDetail as any)?.data?.data || (accountDetail as any)?.data || accountDetail;
  const accountData = accountDetailData(rawData);

  const [selectedRecords, setSelectedRecords] = useState<TransactionByAccountModel[]>([]);
  const [activeTab, setActiveTab] = useState<string>('transactions');
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isDeleteTransactionsModalOpen, setIsDeleteTransactionsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const { searchQuery, setSearchQuery, selectedDate, setSelectedDate, resetSelection } =
    useFilterTransaction();

  // Financial calculations
  const normalBalance = useMemo(
    () => getNormalBalance(accountData.category?.name, accountData.type),
    [accountData.category?.name, accountData.type]
  );

  const metrics = useMemo(() => {
    const list = transactions || [];
    let debitSum = 0;
    let creditSum = 0;
    let debitCount = 0;
    let creditCount = 0;

    list.forEach((t) => {
      const d = Number(t.debit) || 0;
      const c = Number(t.credit) || 0;
      if (d > 0) {
        debitSum += d;
        debitCount++;
      }
      if (c > 0) {
        creditSum += c;
        creditCount++;
      }
    });

    return {
      totalDebit: debitSum,
      totalCredit: creditSum,
      debitCount,
      creditCount,
      totalCount: list.length,
    };
  }, [transactions]);

  const handleArchiveAccount = async () => {
    if (!idAccount) return;

    setIsArchiving(true);
    try {
      await archiveAccount(idAccount);
      notifications.show({
        color: 'teal',
        autoClose: 3000,
        title: 'Berhasil',
        message: accountData.isArchived ? 'Akun berhasil dipulihkan' : 'Akun berhasil diarsipkan',
      });
      await queryClient.refetchQueries({ queryKey: ['detail_account', idAccount] });
      setIsArchiveModalOpen(false);
    } catch (error: any) {
      notifications.show({
        color: 'red',
        autoClose: 3000,
        title: 'Gagal',
        message: error?.response?.data?.message || 'Gagal mengubah status arsip akun',
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!idAccount) return;
    deleteAccount(
      { accountIds: [idAccount] },
      {
        onSuccess: () => {
          notifications.show({
            color: 'teal',
            title: 'Akun Berhasil Dihapus',
            message: `Akun ${accountData.name} telah berhasil dihapus.`,
          });
          setIsDeleteAccountModalOpen(false);
          navigate(routes.generalJournal.main);
        },
      }
    );
  };

  const handleDeleteSelectedTransactions = () => {
    if (!idAccount || selectedRecords.length === 0) return;
    const selectedIds = selectedRecords.map((r) => r.id);
    deleteTransactionMutation.mutate(
      { ids: selectedIds, idAccount },
      {
        onSuccess: () => {
          notifications.show({
            color: 'teal',
            title: 'Transaksi Berhasil Dihapus',
            message: `${selectedIds.length} transaksi jurnal telah dihapus.`,
          });
          setSelectedRecords([]);
          setIsDeleteTransactionsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['transaction_by_account', idAccount] });
          queryClient.invalidateQueries({ queryKey: ['detail_account', idAccount] });
        },
        onError: (err: any) => {
          notifications.show({
            color: 'red',
            title: 'Gagal Menghapus Transaksi',
            message: err?.response?.data?.message || 'Terjadi kesalahan saat menghapus transaksi.',
          });
        },
      }
    );
  };

  if (isLoadingAccount || isLoadingTransaction) {
    return (
      <DetailAccountLayout>
        <Center h={400}>
          <Stack align="center" gap="sm">
            <Loader color="primary.6" size="lg" />
            <Text size="sm" c="dimmed">
              Memuat data buku besar akun...
            </Text>
          </Stack>
        </Center>
      </DetailAccountLayout>
    );
  }

  const hasFilter = !!searchQuery || !!selectedDate;

  return (
    <>
      <DetailAccountLayout>
        <Container fluid p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="xl">
            {/* Canonical Module Header */}
            <ModuleHeader
              icon={IconNotebook}
              title={accountData.name || 'Detail Buku Besar'}
              description={
                <Stack gap={6}>
                  <Group gap="xs" wrap="wrap" align="center">
                    <Badge variant="outline" color="primary" radius="sm" ff="monospace" fw={700}>
                      {accountData.accountNumber}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {accountData.category?.name || 'Buku Besar'} • Saldo Normal: {normalBalance}
                    </Text>
                    {accountData.isArchived && (
                      <Badge variant="filled" color="gray" size="sm" radius="sm">
                        Diarsipkan
                      </Badge>
                    )}
                    {accountData.isLocked && (
                      <Badge
                        variant="light"
                        color="orange"
                        size="sm"
                        radius="sm"
                        leftSection={<IconLock size={12} />}
                      >
                        Terkunci
                      </Badge>
                    )}
                  </Group>
                  <Text size="sm" c="dimmed" mt={2}>
                    {accountData.description ||
                      'Buku besar akun untuk melacak mutasi debit dan kredit, rincian jurnal transaksi, serta posisi saldo berjalan.'}
                  </Text>
                </Stack>
              }
              breadcrumbs={[
                { label: 'Buku Besar & Jurnal', to: routes.generalJournal.main },
                {
                  label: accountData.category?.name || 'Daftar Akun',
                  to: routes.generalJournal.main,
                },
                { label: `${accountData.name} (${accountData.accountNumber})` },
              ]}
              actions={
                <Group gap="xs" wrap="wrap">
                  <Button
                    variant="default"
                    size="sm"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => navigate(routes.generalJournal.main)}
                  >
                    Kembali
                  </Button>

                  <Button
                    variant="light"
                    size="sm"
                    color="primary"
                    leftSection={<IconPencil size={16} />}
                    onClick={() =>
                      navigate(
                        routes.generalJournal.editAccountJournal.replace(':idAccount', idAccount!)
                      )
                    }
                  >
                    Ubah Akun
                  </Button>

                  <Menu position="bottom-end" shadow="md" width={200} withArrow>
                    <Menu.Target>
                      <ActionIcon variant="default" size="lg" radius="md" aria-label="Menu Aksi">
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Manajemen Akun</Menu.Label>
                      {!accountData.isLocked && (
                        <>
                          <Menu.Item
                            leftSection={<IconArchive size={16} />}
                            onClick={() => setIsArchiveModalOpen(true)}
                            disabled={isArchiving}
                          >
                            {accountData.isArchived ? 'Pulihkan Akun' : 'Arsipkan Akun'}
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => setIsDeleteAccountModalOpen(true)}
                          >
                            Hapus Akun
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Dropdown>
                  </Menu>

                  <Button
                    variant="gradient"
                    gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
                    size="sm"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                  >
                    Buat Transaksi Jurnal
                  </Button>
                </Group>
              }
            />

            {/* Quick Financial KPI Cards - 4 Columns */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      Saldo Buku Besar Saat Ini
                    </Text>
                    <Text fz={22} fw={800} c="dark.8" mt={4} lh={1.1} ff="monospace">
                      {formatCurrency(accountData.amount || 0)}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      Posisi saldo akun pada neraca
                    </Text>
                  </div>
                  <ThemeIcon size={40} radius="md" variant="light" color="primary">
                    <IconScale size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>

              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      Posisi Saldo Normal
                    </Text>
                    <Text
                      fz={22}
                      fw={800}
                      c={normalBalance === 'Debit' ? 'teal.8' : 'red.8'}
                      mt={4}
                      lh={1.1}
                    >
                      {normalBalance}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      Bertambah pada sisi {normalBalance}
                    </Text>
                  </div>
                  <ThemeIcon
                    size={40}
                    radius="md"
                    variant="light"
                    color={normalBalance === 'Debit' ? 'teal' : 'red'}
                  >
                    <IconBookmarks size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>

              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      Total Mutasi Debit
                    </Text>
                    <Text fz={22} fw={800} c="teal.8" mt={4} lh={1.1} ff="monospace">
                      {formatCurrency(metrics.totalDebit)}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {metrics.debitCount} transaksi pada sisi debit
                    </Text>
                  </div>
                  <ThemeIcon size={40} radius="md" variant="light" color="teal">
                    <IconArrowDownRight size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>

              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      Total Mutasi Kredit
                    </Text>
                    <Text fz={22} fw={800} c="red.8" mt={4} lh={1.1} ff="monospace">
                      {formatCurrency(metrics.totalCredit)}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {metrics.creditCount} transaksi pada sisi kredit
                    </Text>
                  </div>
                  <ThemeIcon size={40} radius="md" variant="light" color="red">
                    <IconArrowUpRight size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>
            </SimpleGrid>

            {/* Main Content Container with Tabs */}
            <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
              <Tabs
                value={activeTab}
                onChange={(val) => setActiveTab(val || 'transactions')}
                color="primary"
                variant="pills"
                radius="md"
              >
                <Tabs.List mb="md" style={{ borderBottom: '1px solid #E9ECEF', paddingBottom: 12 }}>
                  <Tabs.Tab
                    value="transactions"
                    leftSection={<IconReceipt2 size={16} />}
                    rightSection={
                      metrics.totalCount > 0 ? (
                        <Badge size="xs" variant="light" color="primary">
                          {metrics.totalCount}
                        </Badge>
                      ) : null
                    }
                  >
                    Mutasi Jurnal Transaksi
                  </Tabs.Tab>

                  <Tabs.Tab value="info" leftSection={<IconInfoCircle size={16} />}>
                    Informasi & Atribut Akun
                  </Tabs.Tab>
                </Tabs.List>

                {/* Tab 1: Mutasi Jurnal Transaksi */}
                <Tabs.Panel value="transactions" pt="xs">
                  <Stack gap="md">
                    {/* Modern Filter Toolbar */}
                    <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                      <Group gap="sm" style={{ flex: 1, minWidth: 280 }} wrap="wrap">
                        <TextInput
                          placeholder="Cari no. transaksi, catatan, atau rincian..."
                          size="sm"
                          radius="md"
                          leftSection={<IconSearch size={16} />}
                          rightSection={
                            searchQuery ? (
                              <ActionIcon
                                variant="subtle"
                                size="xs"
                                onClick={() => setSearchQuery('')}
                              >
                                <IconX size={12} />
                              </ActionIcon>
                            ) : null
                          }
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.currentTarget.value)}
                          style={{ flex: 1, minWidth: 220, maxWidth: 380 }}
                        />

                        <DatePickerInput
                          placeholder="Pilih Tanggal"
                          valueFormat="DD/MM/YYYY"
                          size="sm"
                          radius="md"
                          leftSection={<IconCalendar size={16} />}
                          clearable
                          value={selectedDate}
                          onChange={setSelectedDate}
                          style={{ width: 170 }}
                        />

                        {hasFilter && (
                          <Button
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={resetSelection}
                            leftSection={<IconX size={14} />}
                          >
                            Reset Filter
                          </Button>
                        )}

                        {selectedRecords.length > 0 && (
                          <Button
                            size="sm"
                            color="red"
                            variant="light"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => setIsDeleteTransactionsModalOpen(true)}
                          >
                            Hapus Terpilih ({selectedRecords.length})
                          </Button>
                        )}
                      </Group>

                      <Group gap="xs">
                        <Tooltip label="Segarkan Data Mutasi">
                          <ActionIcon
                            variant="default"
                            size="lg"
                            radius="md"
                            onClick={() => refetchTransactions()}
                            aria-label="Refresh"
                          >
                            <IconRefresh size={18} />
                          </ActionIcon>
                        </Tooltip>

                        <Button
                          size="sm"
                          variant="gradient"
                          gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
                          leftSection={<IconPlus size={16} />}
                          onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                        >
                          Tambah Transaksi
                        </Button>
                      </Group>
                    </Group>

                    {/* Ledger Transactions Table */}
                    <TableJournalTransaction
                      selectedRecords={selectedRecords}
                      setSelectedRecords={setSelectedRecords}
                      noRecordsContent={
                        <JournalEmptyState
                          onButtonClick={() =>
                            navigate(routes.generalJournal.addTransactionJournal)
                          }
                        />
                      }
                      data={transactions}
                    />
                  </Stack>
                </Tabs.Panel>

                {/* Tab 2: Informasi & Atribut Akun */}
                <Tabs.Panel value="info" pt="xs">
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                    {/* Profil Akun Card */}
                    <Paper withBorder radius="md" p="lg" bg="gray.0">
                      <Title order={5} fw={700} c="dark.8" mb="md">
                        Rincian Profil Akun
                      </Title>
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Kode Akun (Nomor COA)
                          </Text>
                          <Badge variant="outline" color="primary" ff="monospace" size="md">
                            {accountData.accountNumber}
                          </Badge>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Nama Akun Resmi
                          </Text>
                          <Text size="sm" fw={600} c="dark.8">
                            {accountData.name}
                          </Text>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Kategori Akun
                          </Text>
                          <Badge variant="light" color="indigo">
                            {accountData.category?.name || 'Buku Besar'}
                          </Badge>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Level Hirarki Akun
                          </Text>
                          <Text size="sm" fw={600} c="dark.8">
                            Level {accountData.level || '0'} (
                            {Number(accountData.level) > 1 ? 'Sub Akun' : 'Akun Utama'})
                          </Text>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Status Penguncian
                          </Text>
                          {accountData.isLocked ? (
                            <Badge color="blue" variant="filled">
                              Terkunci (Akun Sistem)
                            </Badge>
                          ) : (
                            <Badge color="teal" variant="light">
                              Dapat Disesuaikan
                            </Badge>
                          )}
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Status Publikasi & Akses
                          </Text>
                          <Text size="sm" fw={500} c="dark.7">
                            {accountData.isAllUser ? 'Semua Pengguna' : 'Terbatas'}
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>

                    {/* Panduan Akuntansi & Aturan Mutasi Card */}
                    <Paper withBorder radius="md" p="lg" bg="gray.0">
                      <Title order={5} fw={700} c="dark.8" mb="md">
                        Karakteristik & Panduan Akuntansi
                      </Title>
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Posisi Saldo Normal
                          </Text>
                          <Badge
                            color={normalBalance === 'Debit' ? 'teal' : 'red'}
                            variant="filled"
                            size="md"
                          >
                            {normalBalance}
                          </Badge>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Efek Mutasi Sisi Debit
                          </Text>
                          <Text
                            size="sm"
                            fw={600}
                            c={normalBalance === 'Debit' ? 'teal.7' : 'red.6'}
                          >
                            {normalBalance === 'Debit'
                              ? 'Menambah Saldo Akun (+)'
                              : 'Mengurangi Saldo Akun (-)'}
                          </Text>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Efek Mutasi Sisi Kredit
                          </Text>
                          <Text
                            size="sm"
                            fw={600}
                            c={normalBalance === 'Kredit' ? 'teal.7' : 'red.6'}
                          >
                            {normalBalance === 'Kredit'
                              ? 'Menambah Saldo Akun (+)'
                              : 'Mengurangi Saldo Akun (-)'}
                          </Text>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Saldo Buku Besar Saat Ini
                          </Text>
                          <Text size="sm" fw={700} ff="monospace" c="dark.8">
                            {formatCurrency(accountData.amount || 0)}
                          </Text>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Draft Saldo Awal
                          </Text>
                          <Text size="sm" ff="monospace" c="dimmed">
                            {formatCurrency(accountData.draftAmount || 0)}
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  </SimpleGrid>
                </Tabs.Panel>
              </Tabs>
            </Paper>
          </Stack>
        </Container>
      </DetailAccountLayout>

      {/* Delete Account Modal */}
      <ConfirmModal
        opened={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Hapus Akun Jurnal"
        message={
          <>
            Apakah Anda yakin ingin menghapus akun <strong>{accountData.name}</strong> (
            {accountData.accountNumber})?
          </>
        }
        helperText="Data akun beserta riwayat yang terkait akan dihapus. Data yang telah dihapus tidak dapat dipulihkan."
        imageSrc={deleteModalImage}
        confirmLabel="Hapus Akun"
        cancelLabel="Batal"
        confirmLoading={isDeletingAccount}
      />

      {/* Archive Account Modal */}
      <ConfirmModal
        opened={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchiveAccount}
        title={accountData.isArchived ? 'Pulihkan Akun' : 'Arsipkan Akun'}
        message={
          accountData.isArchived ? (
            <>
              Apakah Anda yakin ingin memulihkan akun <strong>{accountData.name}</strong> ke daftar
              aktif?
            </>
          ) : (
            <>
              Apakah Anda yakin ingin mengarsipkan akun <strong>{accountData.name}</strong>?
            </>
          )
        }
        helperText={
          accountData.isArchived
            ? 'Akun akan kembali muncul di daftar aktif dan dapat dipilih dalam transaksi jurnal baru.'
            : 'Akun akan disembunyikan dari transaksi baru namun riwayat laporan tetap tersimpan aman.'
        }
        imageSrc={arsipkanIcon}
        confirmLabel={accountData.isArchived ? 'Pulihkan Akun' : 'Arsipkan Akun'}
        cancelLabel="Batal"
        confirmLoading={isArchiving}
        confirmButtonProps={{
          color: accountData.isArchived ? 'primary' : '#64748b',
          leftSection: <IconArchive size={18} />,
        }}
      />

      {/* Delete Selected Transactions Modal */}
      <ConfirmModal
        opened={isDeleteTransactionsModalOpen}
        onClose={() => setIsDeleteTransactionsModalOpen(false)}
        onConfirm={handleDeleteSelectedTransactions}
        title="Hapus Transaksi Jurnal"
        message={
          <>
            Apakah Anda yakin ingin menghapus{' '}
            <strong>{selectedRecords.length} transaksi jurnal</strong> yang dipilih?
          </>
        }
        helperText="Transaksi yang dihapus akan mempengaruhi saldo buku besar dan tidak dapat dipulihkan kembali."
        imageSrc={deleteModalImage}
        confirmLabel={`Hapus ${selectedRecords.length} Transaksi`}
        cancelLabel="Batal"
        confirmLoading={deleteTransactionMutation.isPending}
      />
    </>
  );
};

export default DetailAccountNonCashBank;
