import {
  Button,
  Checkbox,
  Container,
  Flex,
  Grid,
  Menu,
  Paper,
  Select,
  Stack,
  TextInput,
  Group,
  Badge,
} from '@mantine/core';
import {
  IconSearch,
  IconSettings,
  IconDots,
  IconTrash,
  IconReportMoney,
  IconKey,
  IconChevronDown,
} from '@tabler/icons-react';
import {
  PlusIcon,
  MoneyWavyIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Shared imports using barrel exports
import { ConfirmModal, PageHeader } from '@/components';
import { routes } from '@/router/routes';
import { useAccountStore, useJournalAccountStore } from '@/store';
import classes from './GeneralJournal.module.css';

// Feature imports
import {
  useDeleteJurnalAccount,
  getJournalAccounts,
} from '@/module/GeneralJournal/JournalAccount/services';
import { useDraftAccount } from '@/module/GeneralJournal/BeginningBalance/hooks/useDraftBalance';
import { BeginningBalanceModal } from '@/module/GeneralJournal/BeginningBalance/components/BeginningBalanceModal';
import { PeriodAndClosingBooksModal } from '@/module/GeneralJournal/PeriodeLockAndClosingBooks/components/PeriodAndClosingBooksModal';
import { SettingAccountModal } from '@/module/GeneralJournal/SettingAccount/pages/SettingAccountModal';
import TableAccounts from '@/module/GeneralJournal/Main/components/TableJournalAccount/TableAccount';
import GeneralJournalLayout from './Layout';
import { themeColors } from '@/theme/theme.exports';
import { useJournalAccounts } from '../../JournalAccount/hooks/useJournalAccounts';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';

const GeneralJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const { accounts, isError, isLoading } = useJournalAccounts(showArchived);
  const JournalAccounts = Array.isArray(accounts) ? accounts : [];
  const categoryAccounts = Array.from(
    new Set(
      JournalAccounts.map((account) => account.category?.name).filter((name): name is string =>
        Boolean(name)
      )
    )
  );
  const { selectedRecords } = useAccountStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteJurnalAccount();
  const { draftAccounts } = useDraftAccount();

  const searchData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value);
  };
  const filterData = (value: string | null) => {
    setSelectedCategory(value);
  };

  const [modals, setModals] = useState({
    beginningBalance: false,
    settingAccount: false,
    periodAndClosingBooks: false,
    deleteConfirmation: false,
  });

  const openModal = (modalName: string) => {
    setModals((prevState) => ({
      ...prevState,
      [modalName]: true,
    }));
  };

  const closeModal = (modalName: string) => {
    setModals((prevState) => ({
      ...prevState,
      [modalName]: false,
    }));
  };

  useEffect(() => {
    if (modals.beginningBalance || modals.settingAccount || modals.periodAndClosingBooks) {
      setSelectedCategory(null);
    }
  }, [modals]);

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
    if (draftAccounts.status === false) {
      openModal('beginningBalance');
      return;
    }
    navigate(routes.generalJournal.beginningBalance);
  };

  return (
    <GeneralJournalLayout>
      <Container fluid className={classes.pageRoot}>
        <Stack gap="lg">
          <Paper className={classes.sectionPaper}>
            <PageHeader
              title="Daftar Akun"
              actionButton={
                <Group gap="sm" className={classes.headerActions}>
                  <Menu width={240} position="bottom-end" withinPortal shadow="md">
                    <Menu.Target>
                      <Button
                        variant="filled"
                        color={themeColors.slate[1]}
                        style={{ '--button-color': themeColors.black[9] } as React.CSSProperties}
                        leftSection={<MoneyWavyIcon size={14} />}
                      >
                        Buat Jurnal Transaksi
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<PlusIcon size={16} />}
                        onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                      >
                        Tambah Transaksi
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<DownloadSimpleIcon size={16} />}
                        onClick={() => navigate(routes.generalJournal.bankStatementDraftImport)}
                      >
                        Import Transaksi
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                  <Button
                    variant="filled"
                    leftSection={<PlusIcon size={14} />}
                    color={themeColors.teal[5]}
                    onClick={() => navigate(routes.generalJournal.addAccountJournal)}
                  >
                    Tambah Akun
                  </Button>
                </Group>
              }
            />
          </Paper>
          <Paper className={classes.sectionPaper}>
            <Stack gap="md">
              <Flex
                className={classes.filtersBar}
                direction={{ base: 'column', md: 'row' }}
                wrap="wrap"
              >
                <Grid columns={24} gutter="sm" className={classes.filtersGrid}>
                  <Grid.Col span={{ base: 24, sm: 12, lg: 8 }}>
                    <TextInput
                      className={classes.controlField}
                      size="md"
                      leftSectionPointerEvents="none"
                      leftSection={<IconSearch size={16} />}
                      placeholder="Cari Kode atau Nama Akun"
                      value={searchQuery}
                      onChange={searchData}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 24, sm: 12, lg: 8 }}>
                    <Select
                      className={classes.controlField}
                      size="md"
                      placeholder="Pilih Kategori Akun"
                      data={categoryAccounts}
                      value={selectedCategory}
                      onChange={filterData}
                      clearable={!!selectedCategory}
                      rightSection={!selectedCategory ? <IconChevronDown size={16} /> : null}
                      comboboxProps={{ width: 400, position: 'bottom-start' }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 24, sm: 12, lg: 4 }}>
                    <Button
                      variant="default"
                      className={`${classes.checkboxButton} ${classes.controlField}`}
                      size="md"
                      fullWidth
                    >
                      <Checkbox
                        checked={showArchived}
                        onChange={(e) => setShowArchived(e.currentTarget.checked)}
                        label="Lihat Diarsipkan"
                        color="teal"
                        variant="outline"
                        size="xs"
                      />
                    </Button>
                  </Grid.Col>
                </Grid>
                <Group gap="sm" className={classes.actionsGrid}>
                  {selectedRecords.length > 0 && (
                    <Button
                      onClick={() => openModal('deleteConfirmation')}
                      className={`${classes.dangerButton} ${classes.controlField}`}
                      size="md"
                      leftSection={<IconTrash size={16} />}
                      rightSection={
                        <Badge
                          color="white"
                          variant="filled"
                          size="sm"
                          circle
                          style={{ color: 'var(--jurnal-color-danger)' }}
                        >
                          {selectedRecords.length}
                        </Badge>
                      }
                    >
                      Hapus Akun
                    </Button>
                  )}
                  <Menu width={300} position="bottom-end" withinPortal>
                    <Menu.Target>
                      <Button
                        variant="default"
                        className={classes.controlField}
                        leftSection={<IconDots size={16} />}
                        size="md"
                      >
                        Other Actions
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconSettings size={16} />}
                        onClick={() => openModal('settingAccount')}
                      >
                        Setting Account
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconReportMoney size={16} />}
                        onClick={handleButtonInitialBalance}
                      >
                        Beginning Balance
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconKey size={16} />}
                        onClick={() => openModal('periodAndClosingBooks')}
                      >
                        Period Lock & Closing Books
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                  <SettingAccountModal
                    opened={modals.settingAccount}
                    onClose={() => closeModal('settingAccount')}
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
                    title="Hapus Akun"
                    message={
                      // <>
                      //   Apakah Anda yakin ingin menghapus <strong>{selectedRecords.length}</strong>{' '}
                      //   akun yang dipilih?
                      // </>
                      <>
                        Apakah Anda yakin ingin menghapus semua data akun jurnal ini?
                      </>
                    }
                    helperText="Data yang dihapus tidak dapat dipulihkan kembali."
                    imageSrc={deleteModalImage}
                    confirmLabel="Hapus Akun"
                    cancelLabel="Batal"
                    confirmLoading={isDeleting}
                  />
                </Group>
              </Flex>
              <TableAccounts
                data={accounts || []}
                error={isError}
                loading={isLoading}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
              />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </GeneralJournalLayout>
  );
};

export default GeneralJournalPage;
