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
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components';
import { routes } from '@/router';
import { gradientColors, themeColors } from '@/theme';
import { useEffect, useState } from 'react';
import { BeginningBalanceModal } from '@/module/JurnalUmum/SaldoAwal/components/BeginningBalanceModal';
import { PeriodAndClosingBooksModal } from '@/module/JurnalUmum/PenutupanPeriode/components/PeriodAndClosingBooksModal';
import { SettingAccountModal } from '@/module/JurnalUmum/PengaturanAkun/pages/SettingAccountModal';
import TableAccounts from '@/module/JurnalUmum/AkunJurnal/Daftar/components/TableJournalAccount/TableAccount';
import useAccountStore from '@/store/useAccountLedger';
import clasess from './GeneralJournal.module.css'
import { useDraftAccount } from '@/module/JurnalUmum/SaldoAwal/hooks/useDraftBalance';
import { useDeleteJurnalAccount } from '@/module/JurnalUmum/AkunJurnal/services/DeleteTransaction.service';
import { useJournalAccounts } from '@/module/JurnalUmum/AkunJurnal/hooks/useJournalAccounts';
import GeneralJournalLayout from '@/module/JurnalUmum/AkunJurnal/Daftar/pages/Layout';


const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

const BudgetManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts, isError, isLoading } = useJournalAccounts();
    const JournalAccounts = Array.isArray(accounts) ? accounts : [];
    const categoryAccounts = Array.from(new Set(JournalAccounts.map((account) => account.category?.name).filter((name): name is string => Boolean(name))));
    const { selectedRecords } = useAccountStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const { mutate: deleteAccount } = useDeleteJurnalAccount();
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
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <PageHeader
                            title={`List Account`}
                            actionButton={
                                <Group>
                                    <Button
                                        variant="light"
                                        color={themeColors.grey[7]}
                                        onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                                    >
                                        Add Transaction Journal
                                    </Button>
                                    <Button
                                        variant="gradient"
                                        gradient={gradientColors.gradient}
                                        onClick={() => navigate(routes.generalJournal.addAccountJournal)}
                                    >
                                        Add Account
                                    </Button>
                                </Group>
                            }
                        />
                    </Paper>
                    <Paper {...PAPER_PROPS}>
                        <Stack>
                            <Flex gap="xs" justify="space-between" align="center" direction="row" wrap="wrap">
                                <Grid columns={24} gutter="sm">
                                    <Grid.Col span={8}>
                                        <TextInput
                                            leftSectionPointerEvents="none"
                                            leftSection={<IconSearch size={16} />}
                                            placeholder="Find Account"
                                            value={searchQuery}
                                            onChange={searchData}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={8}>
                                        <Select
                                            placeholder="Select Category"
                                            data={categoryAccounts}
                                            value={selectedCategory}
                                            onChange={filterData}
                                            clearable={!!selectedCategory}
                                            rightSection={!selectedCategory ? <IconChevronDown size={16} /> : null}
                                            comboboxProps={{ width: 400, position: 'bottom-start' }}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <Button variant="default">
                                            <Checkbox
                                                defaultChecked
                                                label="Show Archive"
                                                color="cyan"
                                                variant="outline"
                                                size="xs"
                                            />
                                        </Button>
                                    </Grid.Col>
                                </Grid>
                                <Grid columns={6}>
                                    {selectedRecords.length > 0 && (
                                        <Grid.Col span={3}>
                                            <Button
                                                onClick={handleDeleteAccount}
                                                color={themeColors.red[6]}
                                                leftSection={<IconTrash size={16}
                                                />}
                                            >
                                                Delete Account
                                            </Button>
                                        </Grid.Col>
                                    )}
                                    <Grid.Col span={3}>
                                        <Menu width={300} position="bottom-end" withinPortal >
                                            <Menu.Target>
                                                <Button variant="default" leftSection={<IconDots size={16} />} size="sm">
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
                                    </Grid.Col>
                                </Grid>
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

export default BudgetManagementPage;
