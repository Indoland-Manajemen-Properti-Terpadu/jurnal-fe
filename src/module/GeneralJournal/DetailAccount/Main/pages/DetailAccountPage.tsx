import React, { useState } from 'react';
import {
  Container,
  Group,
  Paper,
  Stack,
  Button,
  Text,
  Menu,
  Loader,
  Center,
  SimpleGrid,
  Badge,
  Tabs,
  ActionIcon,
  ThemeIcon,
  Tooltip,
  Alert,
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { themeColors } from '@/theme';
import {
  IconBuildingBank,
  IconWallet,
  IconArrowsExchange,
  IconReceipt2,
  IconPlus,
  IconPencil,
  IconArchive,
  IconTrash,
  IconDotsVertical,
  IconChevronDown,
  IconArrowLeft,
  IconFileSpreadsheet,
  IconArrowsShuffle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconAlertCircle,
  IconLock,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/FormatCurrency';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { ConfirmModal } from '@/components';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';
import arsipkanIcon from '@/assets/img/vectors/arsipkan.svg';

import {
  useDeleteAccount,
  useDetailAccount,
  accountDetailData,
  archiveAccount,
} from '@/module/chart-of-accounts';
import { useBankStatement, type BankStatementRow } from '@/module/bank-statements';
import { JournalEmptyState } from '@/components/EmptyState/JournalEmptyState';
import { useJournalEntriesByAccount } from '@/module/journal-entries';
import type { JournalEntryByAccount } from '@/module/journal-entries';
import { GetReconciliation } from '../../Reconciliation/services/GetReconciliation.service';

import DetailAccountLayout from './Layout';
import JournalTransactionTab from '../components/Tabs/JournalTransactionTabs';
import BankStatementTab from '../components/Tabs/BankStatementTab';
import ReconciliationTab from '../components/Tabs/ReconciliationTabs';
import CashMappingTab from '../components/Tabs/CashMappingTabs';

const DetailAccountPage: React.FC = () => {
  const { idAccount } = useParams<{ idAccount: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { accountDetail, isLoading: isLoadingAccount } = useDetailAccount(idAccount!);
  const { data: reconData, isLoading: isLoadingRecon } = GetReconciliation(idAccount!);
  const { data: bankStatementData } = useBankStatement(idAccount!);
  const { data: transactions } = useJournalEntriesByAccount(idAccount!);
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const rawData =
    (accountDetail as any)?.data?.data || (accountDetail as any)?.data || accountDetail;
  const accountData = accountDetailData(rawData);

  const unreconciledCount = reconData?.bankStatements?.filter((bs) => !bs.isReconciled).length || 0;

  const [selectedJournalRecords, setSelectedJournalRecords] = useState<JournalEntryByAccount[]>([]);
  const [selectedBankStatementRecords, setSelectedBankStatementRecords] = useState<
    BankStatementRow[]
  >([]);

  const [activeTab, setActiveTab] = useState<string>('transaction');
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchiveAccount = async () => {
    if (!idAccount) return;

    setIsArchiving(true);
    try {
      await archiveAccount(idAccount);
      notifications.show({
        color: 'teal',
        autoClose: 3000,
        title: 'Berhasil',
        message: accountData.isArchived
          ? 'Akun kas/bank berhasil dipulihkan'
          : 'Akun kas/bank berhasil diarsipkan',
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
            message: `Akun ${accountData.name} telah dihapus dari sistem.`,
          });
          setIsDeleteAccountModalOpen(false);
          navigate(routes.generalJournal.main);
        },
      }
    );
  };

  const handleRefreshBankStatement = () => {
    queryClient.invalidateQueries({ queryKey: ['bank_statement', idAccount] });
    queryClient.invalidateQueries({ queryKey: ['get_reconciliation', idAccount] });
  };

  if (isLoadingAccount) {
    return (
      <DetailAccountLayout>
        <Center h={400}>
          <Stack align="center" gap="sm">
            <Loader color="primary.6" size="lg" />
            <Text size="sm" c="dimmed">
              Memuat detail buku besar kas & bank...
            </Text>
          </Stack>
        </Center>
      </DetailAccountLayout>
    );
  }

  const transactionCount = transactions?.length || 0;
  const statementRecords = bankStatementData?.results || bankStatementData?.resultTransaction || [];
  const statementCount = statementRecords.length;

  return (
    <>
      <DetailAccountLayout>
        <Container fluid p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="xl">
            {/* Canonical Module Header */}
            <ModuleHeader
              icon={IconBuildingBank}
              title={accountData.name || 'Detail Akun Kas & Bank'}
              description={
                <Stack gap={6}>
                  <Group gap="xs" wrap="wrap" align="center">
                    <Badge variant="outline" color="primary" radius="sm" ff="monospace" fw={700}>
                      {accountData.accountNumber}
                    </Badge>
                    <Badge variant="light" color="teal" radius="sm">
                      Kas & Bank
                    </Badge>
                    {accountData.category?.name && accountData.category.name !== 'Kas & Bank' && (
                      <Badge variant="light" color="gray" radius="sm">
                        {accountData.category.name}
                      </Badge>
                    )}
                    {accountData.isArchived && (
                      <Badge variant="filled" color="gray" radius="sm">
                        Diarsipkan
                      </Badge>
                    )}
                    {accountData.isLocked && (
                      <Badge
                        variant="light"
                        color="blue"
                        radius="sm"
                        leftSection={<IconLock size={12} />}
                      >
                        Akun Terkunci
                      </Badge>
                    )}
                  </Group>
                  <Text size="sm" c="dimmed" mt={2}>
                    {accountData.description ||
                      'Buku besar kas dan bank untuk memantau mutasi saldo, pencatatan rekening koran, dan status rekonsiliasi perbankan.'}
                  </Text>
                </Stack>
              }
              breadcrumbs={[
                { label: 'Buku Besar & Jurnal', to: routes.generalJournal.main },
                { label: 'Kas & Bank', to: routes.generalJournal.main },
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

                  <Menu position="bottom-end" shadow="md" width={220} withArrow>
                    <Menu.Target>
                      <Button
                        variant="gradient"
                        gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
                        size="sm"
                        leftSection={<IconPlus size={16} />}
                        rightSection={<IconChevronDown size={14} />}
                      >
                        Buat Transaksi
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Transaksi Kas & Bank</Menu.Label>
                      <Menu.Item
                        leftSection={<IconPlus size={16} />}
                        onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                      >
                        Jurnal Transaksi
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconArrowsExchange size={16} />}
                        onClick={() => navigate(routes.BankAndCash.AddTransferMoney)}
                      >
                        Transfer Uang
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconArrowDownRight size={16} />}
                        onClick={() => navigate(routes.BankAndCash.AddReceiveMoney)}
                      >
                        Terima Uang
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconArrowUpRight size={16} />}
                        onClick={() => navigate(routes.BankAndCash.AddSentMoney)}
                      >
                        Kirim Uang
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              }
            />

            {/* Notification / Alert Banner if Unreconciled */}
            {unreconciledCount > 0 && (
              <Alert
                icon={<IconAlertCircle size={18} />}
                color="orange"
                variant="light"
                radius="md"
                title="Perhatian: Terdapat Transaksi Belum Rekonsiliasi"
              >
                Terdapat <strong>{unreconciledCount} transaksi</strong> pada rekening koran yang
                belum dicocokkan dengan catatan jurnal. Buka tab <strong>Rekonsiliasi Bank</strong>{' '}
                untuk mencocokkan data.
              </Alert>
            )}

            {/* Quick Financial KPI Cards - 4 Columns */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      Saldo Buku Besar (ProApps)
                    </Text>
                    <Text fz={22} fw={800} c="dark.8" mt={4} lh={1.1} ff="monospace">
                      {formatCurrency(accountData.amount || 0)}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      Pencatatan saldo sistem Jurnal
                    </Text>
                  </div>
                  <ThemeIcon size={40} radius="md" variant="light" color="teal">
                    <IconWallet size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>

              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      Saldo Rekening Koran (Bank)
                    </Text>
                    <Text fz={22} fw={800} c="blue.8" mt={4} lh={1.1} ff="monospace">
                      {formatCurrency(reconData?.balance ?? accountData.amount ?? 0)}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      Berdasarkan data rekening bank
                    </Text>
                  </div>
                  <ThemeIcon size={40} radius="md" variant="light" color="blue">
                    <IconBuildingBank size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>

              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      Status Rekonsiliasi
                    </Text>
                    <Text
                      fz={22}
                      fw={800}
                      c={unreconciledCount === 0 ? 'teal.8' : 'orange.8'}
                      mt={4}
                      lh={1.1}
                    >
                      {unreconciledCount === 0
                        ? 'Seimbang (Match)'
                        : `${unreconciledCount} Belum Rekon`}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {unreconciledCount === 0
                        ? 'Semua transaksi bank cocok'
                        : 'Memerlukan pencocokan data'}
                    </Text>
                  </div>
                  <ThemeIcon
                    size={40}
                    radius="md"
                    variant="light"
                    color={unreconciledCount === 0 ? 'teal' : 'orange'}
                  >
                    <IconArrowsExchange size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>

              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      Total Jurnal Tercatat
                    </Text>
                    <Text fz={22} fw={800} c="dark.8" mt={4} lh={1.1}>
                      {transactionCount.toLocaleString('id-ID')} Mutasi
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      Riwayat transaksi debit & kredit
                    </Text>
                  </div>
                  <ThemeIcon size={40} radius="md" variant="light" color="indigo">
                    <IconReceipt2 size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>
            </SimpleGrid>

            {/* Main Tabs Container */}
            <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
              <Tabs
                value={activeTab}
                onChange={(val) => setActiveTab(val || 'transaction')}
                color="primary"
                variant="pills"
                radius="md"
              >
                <Tabs.List mb="md" style={{ borderBottom: '1px solid #E9ECEF', paddingBottom: 12 }}>
                  <Tabs.Tab
                    value="transaction"
                    leftSection={<IconReceipt2 size={16} />}
                    rightSection={
                      transactionCount > 0 ? (
                        <Badge size="xs" variant="light" color="primary">
                          {transactionCount}
                        </Badge>
                      ) : null
                    }
                  >
                    Jurnal Transaksi
                  </Tabs.Tab>

                  <Tabs.Tab
                    value="bankStatement"
                    leftSection={<IconFileSpreadsheet size={16} />}
                    rightSection={
                      statementCount > 0 ? (
                        <Badge size="xs" variant="light" color="blue">
                          {statementCount}
                        </Badge>
                      ) : null
                    }
                  >
                    Rekening Koran
                  </Tabs.Tab>

                  <Tabs.Tab
                    value="reconciliation"
                    leftSection={<IconArrowsExchange size={16} />}
                    rightSection={
                      unreconciledCount > 0 ? (
                        <Badge color="orange" size="xs" circle>
                          {unreconciledCount}
                        </Badge>
                      ) : (
                        <Badge color="teal" size="xs" variant="light">
                          Match
                        </Badge>
                      )
                    }
                  >
                    Rekonsiliasi Bank
                  </Tabs.Tab>

                  <Tabs.Tab value="cashMapping" leftSection={<IconArrowsShuffle size={16} />}>
                    Pemetaan Kas
                  </Tabs.Tab>
                </Tabs.List>

                {/* Panel 1: Jurnal Transaksi */}
                <Tabs.Panel value="transaction" pt="xs">
                  <JournalTransactionTab
                    selectedRecords={selectedJournalRecords}
                    setSelectedRecords={setSelectedJournalRecords}
                    noRecordsContent={
                      <JournalEmptyState
                        onButtonClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                      />
                    }
                  />
                </Tabs.Panel>

                {/* Panel 2: Rekening Koran */}
                <Tabs.Panel value="bankStatement" pt="xs">
                  <BankStatementTab
                    selectedRecords={selectedBankStatementRecords}
                    setSelectedRecords={setSelectedBankStatementRecords}
                    idAccount={idAccount!}
                    onRefresh={handleRefreshBankStatement}
                  />
                </Tabs.Panel>

                {/* Panel 3: Rekonsiliasi Bank */}
                <Tabs.Panel value="reconciliation" pt="xs">
                  <ReconciliationTab />
                </Tabs.Panel>

                {/* Panel 4: Pemetaan Kas */}
                <Tabs.Panel value="cashMapping" pt="xs">
                  <CashMappingTab />
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
        title="Hapus Akun Kas & Bank"
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
        confirmLoading={isDeleting}
      />

      {/* Archive Account Modal */}
      <ConfirmModal
        opened={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchiveAccount}
        title={accountData.isArchived ? 'Pulihkan Akun Kas & Bank' : 'Arsipkan Akun Kas & Bank'}
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
            ? 'Akun akan kembali muncul di daftar aktif kas & bank dan dapat digunakan dalam transaksi.'
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
    </>
  );
};

export default DetailAccountPage;
