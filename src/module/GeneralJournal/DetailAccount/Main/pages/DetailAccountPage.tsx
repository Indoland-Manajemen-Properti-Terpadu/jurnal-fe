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
import { themeColors, gradientColors } from '@/theme';
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
import { PlusIcon, MoneyWavyIcon } from '@phosphor-icons/react';
// Constants
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { archiveAccount } from '../services/DetailAccount.service';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
  withBorder: true,
};

const DetailAccount = () => {
  const { idAccount } = useParams<{ idAccount: string }>();
  const navigate = useNavigate();
  const { accountDetail, isLoading } = useDetailAccount(idAccount!);
  const queryClient = useQueryClient();

  const rawData =
    (accountDetail as any)?.data?.data || (accountDetail as any)?.data || accountDetail;
  const accountData = accountDetailData(rawData);

  console.log('Account Detail Raw:', accountDetail);
  console.log('Mapped Account Data:', accountData);

  const journalSelection = useSelectionHandler<TransactionByAccountModel>();
  const bankStatementSelection = useSelectionHandler<Result>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
              <Stack gap="lg">
                <SimpleGrid cols={2}>
                  <Group align="flex-start" wrap="nowrap">
                    <ActionIcon variant="subtle" color="gray" onClick={() => navigate(-1)} mt={4}>
                      <ArrowLeftIcon size={32} weight="duotone" />
                    </ActionIcon>
                    <Stack gap={2}>
                      <Group>
                        <Title order={5}>
                          {accountData.name}{' '}
                          <Text span c={themeColors.primary[6]} inherit>
                            ({accountData.accountNumber})
                          </Text>
                        </Title>
                        {accountData.isArchived && (
                          <Badge color="gray" variant="filled" size="sm" radius="sm">
                            Diarsipkan
                          </Badge>
                        )}
                      </Group>
                      <Text c={themeColors.grey[6]} fz={14}>
                        Kategori {accountData.category?.name}
                      </Text>
                    </Stack>
                  </Group>
                  <Group justify="flex-end">
                    <Menu position="top-end" offset={5} withArrow>
                      <Menu.Target>
                        <Button
                          variant="light"
                          size="md"
                          color={themeColors.grey[7]}
                          leftSection={<IconDots style={{ width: rem(16), height: rem(16) }} />}
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
                        >
                          Ubah Akun
                        </Menu.Item>
                        {!accountData.isLocked && (
                          <>
                            <Menu.Item
                              leftSection={
                                <IconArchive style={{ width: rem(14), height: rem(14) }} />
                              }
                              onClick={handleArchiveAccount}
                              disabled={isArchiving}
                            >
                              {accountData.isArchived ? 'Tampilkan Akun' : 'Arsipkan Akun'}
                            </Menu.Item>
                            <Menu.Item
                              color="red"
                              leftSection={
                                <IconTrash style={{ width: rem(14), height: rem(14) }} />
                              }
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
                          leftSection={<MoneyWavyIcon size={14} />}
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
                <Tabs defaultValue="transaction" color={themeColors.primary[6]}>
                  <Tabs.List>
                    <Tabs.Tab value="transaction">Journal Transaction</Tabs.Tab>
                    <Tabs.Tab value="bankStatement">Bank Statement</Tabs.Tab>
                    <Tabs.Tab value="reconciliation">Reconciliation</Tabs.Tab>
                    <Tabs.Tab value="cashMapping">Cash Mapping</Tabs.Tab>
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
    </>
  );
};

export default DetailAccount;
