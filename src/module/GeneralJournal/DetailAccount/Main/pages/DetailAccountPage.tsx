import {
  Container,
  Group,
  Paper,
  Stack,
  Button,
  Text,
  Title,
  Menu,
  rem,
  Loader,
  Center,
  SimpleGrid,
  Badge,
  Tabs,
  ActionIcon,
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { themeColors } from '@/theme';
import {
  IconPencil,
  IconArchive,
  IconTrash,
  IconDots,
  IconPlus,
  IconReportSearch,
  IconArrowsExchange,
} from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useDetailAccount } from '../hooks/useDetailAccount';
import { accountDetailData } from '../types/DetailAccountModel';
import { TransactionByAccountModel } from '../../TransactionJournal/types/TransactionByAccountModel';
import DetailAccountLayout from './Layout';
import DeleteTransactionModal from '../components/DeleteTransactionModal';
import JournalTransactionTab from '../components/Tabs/JournalTransactionTabs';
import BankStatementTab from '../components/Tabs/BankStatamentTabs';
import CashMappingTab from '../components/Tabs/CashMappingTabs';
import ReconciliationTab from '../components/Tabs/ReconciliationTabs';
import { Result } from '../../BankStatement/types/BankStatementModel';
import { useQueryClient } from '@tanstack/react-query';
import { JournalEmptyState } from '@/components/EmptyState/JournalEmptyState';
import { routes } from '@/router';
import { MoneyWavyIcon } from '@phosphor-icons/react';
// Constants
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { archiveAccount } from '../services/DetailAccount.service';
import { useDeleteJurnalAccount } from '@/module/GeneralJournal/JournalAccount/services';
import { ConfirmModal } from '@/components';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';
import arsipkanIcon from '@/assets/img/vectors/arsipkan.svg';
import { GetReconciliation } from '../../Reconciliation/services/GetReconciliation.service';

const PAPER_PROPS = {
  p: '0',
  shadow: 'md',
  radius: 'md',
  withBorder: true,
};

const DetailAccount = () => {
  const { idAccount } = useParams<{ idAccount: string }>();
  const navigate = useNavigate();
  const { accountDetail, isLoading } = useDetailAccount(idAccount!);
  const { data: reconData } = GetReconciliation(idAccount!);
  const queryClient = useQueryClient();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteJurnalAccount();

  const rawData =
    (accountDetail as any)?.data?.data || (accountDetail as any)?.data || accountDetail;
  const accountData = accountDetailData(rawData);

  const unreconciledCount = reconData?.bankStatements?.filter(bs => !bs.isReconciled).length || 0;


  const journalSelection = useSelectionHandler<TransactionByAccountModel>();
  const bankStatementSelection = useSelectionHandler<Result>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleDeleteTransaction = () => {
    notifications.show({
      color: themeColors.red[6],
      autoClose: 3000,
      title: 'Successfully Deleted Transaction',
      message: 'Selected transaction has been deleted',
    });
    setIsDeleteModalOpen(false);
  };

  const handleArchiveAccount = async () => {
    if (!idAccount) return;

    setIsArchiving(true);
    try {
      await archiveAccount(idAccount);
      notifications.show({
        color: themeColors.primary[6],
        autoClose: 3000,
        title: 'Success',
        message: accountData.isArchived ? 'Account has been restored' : 'Account has been archived',
      });
      // Refresh the account detail data
      await queryClient.refetchQueries({ queryKey: ['detail_account', idAccount] });
      setIsArchiveModalOpen(false);
    } catch (error: any) {
      notifications.show({
        color: themeColors.red[6],
        autoClose: 3000,
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to archive account',
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
          setIsDeleteAccountModalOpen(false);
          navigate(routes.generalJournal.main);
        },
      }
    );
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['bank_statement', idAccount] });
  };

  function useSelectionHandler<T>(initialSelection: T[] = []) {
    const [selectedRecords, setSelectedRecords] = useState<T[]>(initialSelection);
    return { selectedRecords, setSelectedRecords };
  }

  if (isLoading) {
    return (
      <DetailAccountLayout>
        <Center h={300}>
          <Loader color={themeColors.primary[6]} />
        </Center>
      </DetailAccountLayout>
    );
  }

  return (
    <>
      <DetailAccountLayout>
        <Container fluid>
          <Stack gap="lg">
            <Paper {...PAPER_PROPS}>
              <Stack gap={0}>
                <SimpleGrid cols={2} p="md">
                  <Stack gap={4}>
                    <Text size="xs" fw={500} c={themeColors.primary[6]} ml={40}>
                      Kas & Bank
                    </Text>
                    <Group align="flex-start" wrap="nowrap">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => navigate(-1)}
                        mt={4}
                      >
                        <ArrowLeftIcon size={24} weight="bold" />
                      </ActionIcon>
                      <Stack gap={0}>
                        <Group>
                          <Title order={4} fw={600}>
                            {accountData.name}{' '}
                            <Text span c={themeColors.primary[6]} inherit fw={600}>
                              ({accountData.accountNumber})
                            </Text>
                          </Title>
                          {accountData.isArchived && (
                            <Badge color="gray" variant="filled" size="sm" radius="sm">
                              Diarsipkan
                            </Badge>
                          )}
                        </Group>
                        <Text c={themeColors.grey[6]} fz={12}>
                          {accountData.description || 'akun untuk kas'}
                        </Text>
                      </Stack>
                    </Group>
                  </Stack>
                  <Group justify="flex-end">
                    <Menu position="top-end" offset={5} withArrow>
                      <Menu.Target>
                        <Button
                          variant="light"
                          size="sm"
                          bg="#F1F3F5"
                          color="#495057"
                          leftSection={<IconDots size={16} />}
                        >
                          Aksi Lainnya
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={
                            <IconReportSearch style={{ width: rem(14), height: rem(14) }} />
                          }
                        >
                          Laporan Rekonsiliasi
                        </Menu.Item>
                        <Menu.Item
                          leftSection={
                            <IconArrowsExchange style={{ width: rem(14), height: rem(14) }} />
                          }
                        >
                          Mutasi Rekening Koran
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
                          onClick={() =>
                            navigate(
                              routes.generalJournal.editAccountJournal.replace(
                                ':idAccount',
                                idAccount!
                              )
                            )
                          }
                        >
                          Ubah Akun
                        </Menu.Item>
                        {!accountData.isLocked && (
                          <>
                            <Menu.Item
                              leftSection={
                                <IconArchive style={{ width: rem(14), height: rem(14) }} />
                              }
                              onClick={() => setIsArchiveModalOpen(true)}
                              disabled={isArchiving}
                            >
                              {accountData.isArchived ? 'Tampilkan Akun' : 'Arsipkan Akun'}
                            </Menu.Item>
                            <Menu.Item
                              color="red"
                              leftSection={
                                <IconTrash style={{ width: rem(14), height: rem(14) }} />
                              }
                              onClick={() => setIsDeleteAccountModalOpen(true)}
                            >
                              Hapus Akun
                            </Menu.Item>
                          </>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                    <Menu position="bottom-end" offset={5}>
                      <Menu.Target>
                        <Button
                          variant="filled"
                          size="sm"
                          leftSection={<MoneyWavyIcon size={16} />}
                          color={themeColors.figmaTeal[5]}
                        >
                          Buat Transaksi
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconPlus size={14} />}
                          onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                        >
                          Jurnal Transaksi
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconPlus size={14} />}
                          onClick={() => navigate(routes.BankAndCash.AddTransferMoney)}
                        >
                          Transfer Uang
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </SimpleGrid>
                <Tabs
                  defaultValue="transaction"
                  color={themeColors.figmaTeal[5]}
                  p="md"
                  styles={{
                    tab: {
                      fontWeight: 500,
                      '&[data-active]': {
                        backgroundColor: themeColors.figmaTeal[0],
                        color: themeColors.figmaTeal[6],
                      },
                      '&:hover': {
                        backgroundColor: themeColors.figmaTeal[0],
                      },
                    },
                  }}
                >
                  <Tabs.List>
                    <Tabs.Tab value="transaction">Jurnal Transaksi</Tabs.Tab>
                    <Tabs.Tab value="bankStatement">Rekening Koran</Tabs.Tab>
                    <Tabs.Tab 
                      value="reconciliation"
                      rightSection={
                        unreconciledCount > 0 ? (
                          <Badge w={20} h={20} p={0} variant="filled" color="teal.6" size="xs" circle>
                            {unreconciledCount}
                          </Badge>
                        ) : null
                      }
                    >
                      Rekonsiliasi
                    </Tabs.Tab>
                    <Tabs.Tab value="cashMapping">Pemetaan Kas</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="transaction" pt="md">
                    <JournalTransactionTab
                      selectedRecords={journalSelection.selectedRecords}
                      setSelectedRecords={journalSelection.setSelectedRecords}
                      noRecordsContent={
                        <JournalEmptyState
                          onButtonClick={() =>
                            navigate(routes.generalJournal.addTransactionJournal)
                          }
                        />
                      }
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="bankStatement" pt="md">
                    <BankStatementTab
                      selectedRecords={bankStatementSelection.selectedRecords}
                      setSelectedRecords={bankStatementSelection.setSelectedRecords}
                      idAccount={idAccount!}
                      onRefresh={handleRefresh}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="reconciliation" pt="md">
                    <ReconciliationTab />
                  </Tabs.Panel>

                  <Tabs.Panel value="cashMapping" pt="md">
                    <CashMappingTab />
                  </Tabs.Panel>
                </Tabs>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </DetailAccountLayout>

      <DeleteTransactionModal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteTransaction}
      />

      <ConfirmModal
        opened={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Hapus Akun"
        message={
          <>
            Apakah Anda yakin ingin menghapus akun <strong>{accountData.name}</strong>?
          </>
        }
        helperText="Data yang dihapus tidak dapat dipulihkan kembali."
        imageSrc={deleteModalImage}
        confirmLabel="Hapus Akun"
        cancelLabel="Batal"
        confirmLoading={isDeleting}
      />

      <ConfirmModal
        opened={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchiveAccount}
        title="Arsipkan Akun"
        message="Apakah anda yakin dengan ingin megarsipkan akun ini?"
        helperText="Akun akan disembunyikan dari daftar aktif dan akun dapat dikembalikan kapan saja."
        imageSrc={arsipkanIcon}
        confirmLabel={accountData.isArchived ? 'Tampilkan Akun' : 'Arsipkan Akun'}
        cancelLabel="Batal"
        confirmLoading={isArchiving}
        confirmButtonProps={{
          color: '#64748b',
          leftSection: <IconArchive size={18} />,
        }}
      />
    </>
  );
};

export default DetailAccount;
