import { Button, Container, Group, Menu, Paper, PaperProps, rem, Stack, Title } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import BankAndCashLayout from './Layout';
import useFetchData from '../../../../../hooks/useFetchData';
import StatsBankCashGrid from '../components/StatsBankCashGrid/StatsBankCashGrid';
import BankAndCashTable from '../components/Table/TableBankCash';
import { IconExchange, IconPlus, IconTransferIn, IconTransferOut } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';

const items = [
    { title: 'Settings', href: '#' },
    { title: 'User Management', href: '#' },
]

const PAPER_PROPS: PaperProps = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

const ICON_STYLE = {
    width: rem(14),
    height: rem(14)
}

function BankAndCashMainPage() {
    const navigate = useNavigate();
    const {
        data: statsData,
        error: statsError,
        loading: statsLoading,
    } = useFetchData('/mocks/StatsGrid.json');

    const AddTransactionMenu = () => (
        <Menu position="bottom-end" offset={5} withArrow>
            <Menu.Target>
                <Button variant="light" size="sm" color={themeColors.gray[7]}>
                    Add Transaction
                </Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconPlus style={ICON_STYLE} />}
                    onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                >
                    Transaction Journal
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconExchange style={ICON_STYLE} />}
                    onClick={() => navigate(routes.BankAndCash.AddTransferMoney)}
                >
                    Transfer Money
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconTransferIn style={ICON_STYLE} />}
                    onClick={() => navigate(routes.BankAndCash.AddReceiveMoney)}
                >
                    Receive Money
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconTransferOut style={ICON_STYLE} />}
                    onClick={() => navigate(routes.BankAndCash.AddSentMoney)}
                >
                    Sent Money
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    return (
        <BankAndCashLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <Group justify='space-between'>
                            <Title order={3}>
                                Bank And Cash
                            </Title>
                            <Group>
                                <AddTransactionMenu />
                                <Button
                                    variant="gradient"
                                    size="sm"
                                    gradient={gradientColors.gradient}
                                >
                                    Add Account
                                </Button>
                            </Group>
                        </Group>
                    </Paper>
                    <StatsBankCashGrid
                        data={statsData.data}
                        loading={statsLoading}
                        error={statsError}
                        paperProps={PAPER_PROPS}
                    />
                    <Paper {...PAPER_PROPS}>
                        <BankAndCashTable />
                    </Paper>
                </Stack>
            </Container>
        </BankAndCashLayout>
    );
}

export default BankAndCashMainPage;
