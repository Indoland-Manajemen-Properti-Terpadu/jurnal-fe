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
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Shared imports using barrel exports
import { PageHeader } from '@components';
import { routes } from '@router';
import { useAccountStore } from '@store';
import classes from './GeneralJournal.module.css';

// Feature imports
import {
  useDeleteJurnalAccount,
  GetJournalAccounts
} from '@features/GeneralJournal/JournalAccount/service';
import { GetDraftAccount } from '@features/GeneralJournal/BeginningBalance/service/SetDraftBalance.service';
import { BeginningBalanceModal } from '@features/GeneralJournal/BeginningBalance/components/BeginningBalanceModal';
import { PeriodAndClosingBooksModal } from '@features/GeneralJournal/PeriodeLockAndClosingBooks/components/PeriodAndClosingBooksModal';
import { SettingAccountModal } from '@features/GeneralJournal/SettingAccount/pages/SettingAccountModal';
import TableAccounts from '@features/GeneralJournal/Main/components/TableJournalAccount/TableAccount';
import GeneralJournalLayout from './Layout';
import { themeColors } from '@/theme/theme.exports';


const GeneralJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, isError, isLoading } = GetJournalAccounts();
  const JournalAccounts = Array.isArray(accounts) ? accounts : [];
  const categoryAccounts = Array.from(new Set(JournalAccounts.map((account) => account.category?.name).filter((name): name is string => Boolean(name))));
  const { selectedRecords } = useAccountStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { mutate: deleteAccount } = useDeleteJurnalAccount();
  const { draftAccounts } = GetDraftAccount();

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
      "accountIds": selectedRecords.map((item) => item.id)
    }
    deleteAccount(ids)
  };

  const handleButtonInitialBalance = async () => {
    if (draftAccounts.status === false) {
      openModal('beginningBalance');
      return
    }
    navigate(routes.generalJournal.beginningBalance)
  }

  return (
    <GeneralJournalLayout>
      <Container fluid className={classes.pageRoot}>
        <Stack gap="lg">
          <Paper className={classes.sectionPaper}>
            <PageHeader
              title="Daftar Akun"
              actionButton={
                <Group gap="sm" className={classes.headerActions}>
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<MoneyWavyIcon size={14} />}
                    onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                  >
                    Add Transaction Journal
                  </Button>
                  <Button
                    variant="filled"
                    leftSection={<PlusIcon size={14} />}
                    color={themeColors.figmaTeal[5]}
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
              <Flex className={classes.filtersBar} direction={{ base: 'column', md: 'row' }} wrap="wrap">
                <Grid columns={24} gutter="sm" className={classes.filtersGrid}>
                  <Grid.Col span={{ base: 24, sm: 12, lg: 8 }}>
                    <TextInput
                      className={classes.controlField}
                      size="md"
                      leftSectionPointerEvents="none"
                      leftSection={<IconSearch size={16} />}
                      placeholder="Find Account"
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
                    <Button variant="default" className={`${classes.checkboxButton} ${classes.controlField}`} size="md" fullWidth>
                      <Checkbox
                        defaultChecked
                        label="Show Archive"
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
                      onClick={handleDeleteAccount}
                      className={`${classes.dangerButton} ${classes.controlField}`}
                      size="md"
                      leftSection={<IconTrash size={16} />}
                    >
                      Delete Account
                    </Button>
                  )}
                  <Menu width={300} position="bottom-end" withinPortal>
                    <Menu.Target>
                      <Button variant="default" className={classes.controlField} leftSection={<IconDots size={16} />} size="md">
                        Other Actions
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => openModal('settingAccount')}>
                        Setting Account
                      </Menu.Item>
                      <Menu.Item leftSection={<IconReportMoney size={16} />} onClick={handleButtonInitialBalance}>
                        Beginning Balance
                      </Menu.Item>
                      <Menu.Item leftSection={<IconKey size={16} />} onClick={() => openModal('periodAndClosingBooks')}>
                        Period Lock & Closing Books
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                  <SettingAccountModal opened={modals.settingAccount} onClose={() => closeModal('settingAccount')} />
                  <BeginningBalanceModal opened={modals.beginningBalance} onClose={() => closeModal('beginningBalance')} />
                  <PeriodAndClosingBooksModal opened={modals.periodAndClosingBooks} onClose={() => closeModal('periodAndClosingBooks')} />
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
