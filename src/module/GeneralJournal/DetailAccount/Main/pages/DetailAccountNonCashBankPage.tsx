import {
  Container,
  Group,
  Paper,
  Stack,
  Button,
  Text,
  Title,
  Input,
  SimpleGrid,
  Grid,
  Flex,
  Loader,
  Center,
  Menu,
  rem,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { TextMediumGR } from '@/components/Text/CustomText';
import { gradientColors, themeColors } from '@/theme';
import {
  IconSearch,
  IconTrash,
  IconPlus,
  IconCalendar,
  IconPencil,
  IconArchive,
  IconDots,
} from '@tabler/icons-react';
import DetailAccountLayout from './Layout';
import TableJournalTransaction from '../../TransactionJournal/components/TableTransactionJournal/JournalTransactionTable';
import { useDetailAccount } from '../hooks/useDetailAccount';
import { accountDetailData } from '../types/DetailAccountModel';
import { routes } from '@/router';
import { useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import { TransactionByAccountModel } from '../../TransactionJournal/types/TransactionByAccountModel';
import { MoneyWavyIcon } from '@phosphor-icons/react';
import { GetTransactionByAccount } from '../../TransactionJournal/services/TransactionByAccount.service';
import { JournalEmptyState } from '@/components/EmptyState/JournalEmptyState';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { archiveAccount } from '../services/DetailAccount.service';
import { useDeleteJurnalAccount } from '@/module/GeneralJournal/JournalAccount/services';
import { ConfirmModal } from '@/components';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';
import arsipkanIcon from '@/assets/img/vectors/arsipkan.svg';

const PAPER_PROPS = {
  p: '0',
  shadow: 'md',
  radius: 'md',
  withBorder: true,
};

const DetailAccountNonCashBank = () => {
  const navigate = useNavigate();
  const { idAccount } = useParams<{ idAccount: string }>();
  const { accountDetail, isLoading: isLoadingAccount } = useDetailAccount(idAccount!);
  const { data: transaction, isLoading: isLoadingTransaction } = GetTransactionByAccount(
    idAccount!
  );
  const queryClient = useQueryClient();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteJurnalAccount();

  const rawData =
    (accountDetail as any)?.data?.data || (accountDetail as any)?.data || accountDetail;
  const accountData = accountDetailData(rawData);

  const journalSelection = useSelectionHandler<TransactionByAccountModel>();
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

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
          setIsDeleteModalOpen(false);
          navigate(routes.generalJournal.main);
        },
      }
    );
  };

  function useSelectionHandler<T>(initialSelection: T[] = []) {
    const [selectedRecords, setSelectedRecords] = useState<T[]>(initialSelection);
    return { selectedRecords, setSelectedRecords };
  }

  if (isLoadingAccount || isLoadingTransaction) {
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
                <SimpleGrid cols={2} p="md" style={{ borderBottom: '2px solid #E9ECEF' }}>
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
                    {accountData.isLocked ? (
                      <Button
                        variant="light"
                        size="md"
                        color={themeColors.grey[7]}
                        leftSection={<IconPencil style={{ width: rem(16), height: rem(16) }} />}
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
                      </Button>
                    ) : (
                      <Menu position="top-end" offset={5} withArrow>
                        <Menu.Target>
                          <Button
                            variant="light"
                            size="md"
                            color={themeColors.grey[7]}
                            leftSection={<IconDots style={{ width: rem(16), height: rem(16) }} />}
                          >
                            Aksi
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
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
                          <Menu.Item
                            leftSection={<IconArchive style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => setIsArchiveModalOpen(true)}
                            disabled={isArchiving}
                          >
                            {accountData.isArchived ? 'Tampilkan Akun' : 'Arsipkan Akun'}
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => setIsDeleteModalOpen(true)}
                          >
                            Hapus Akun
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    )}
                  </Group>
                </SimpleGrid>

                <Stack gap="md" p="md">
                  {transaction && transaction.length > 0 && (
                    <Flex justify="space-between" align="center">
                      <Grid columns={24} gutter="sm" align="center" style={{ flex: 1 }}>
                        {/* Input */}
                        <Grid.Col span={8}>
                          <Input
                            placeholder="Find transaction"
                            size="xs"
                            leftSection={<IconSearch size={16} />}
                          />
                        </Grid.Col>

                        {/* DatePicker */}
                        <Grid.Col span={6}>
                          <DatePickerInput
                            placeholder="Date"
                            valueFormat="DD/MM/YYYY"
                            highlightToday
                            size="xs"
                            value={dateValue}
                            onChange={setDateValue}
                            clearable={!!dateValue}
                            rightSection={!dateValue ? <IconCalendar size={16} /> : null}
                          />
                        </Grid.Col>

                        {/* Delete Button */}
                        <Grid.Col span={6}>
                          <Button
                            size="xs"
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => journalSelection.setSelectedRecords([])}
                            style={{
                              visibility:
                                journalSelection.selectedRecords.length > 0 ? 'visible' : 'hidden',
                            }}
                          >
                            Delete All
                          </Button>
                        </Grid.Col>
                      </Grid>

                      {/* Add Transaction Button aligned to the end */}
                      <Button
                        size="xs"
                        variant="gradient"
                        gradient={gradientColors.gradient}
                        rightSection={<IconPlus size={16} />}
                        onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                      >
                        Add Transaction
                      </Button>
                    </Flex>
                  )}
                  <TableJournalTransaction
                    selectedRecords={journalSelection.selectedRecords}
                    setSelectedRecords={journalSelection.setSelectedRecords}
                    noRecordsContent={
                      <JournalEmptyState
                        onButtonClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                      />
                    }
                    data={transaction}
                  />
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </DetailAccountLayout>

      <ConfirmModal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
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
        message="Apakah yakin ingin megarsipkan akun ini?"
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

export default DetailAccountNonCashBank;
