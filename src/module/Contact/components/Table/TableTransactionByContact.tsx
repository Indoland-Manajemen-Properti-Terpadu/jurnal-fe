import { ActionIcon, Anchor, Button, Center, Checkbox, Text, Flex, Grid, Menu, Paper, PaperProps, rem, Select, Stack, TextInput, Container, Badge } from '@mantine/core';
import { themeColors } from '@/theme';
import { IconChevronDown, IconDots, IconInfoCircle, IconSearch, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteJurnalAccount } from '@/module/GeneralJournal/JournalAccount/services/DeleteTransaction.service';
import { useState } from 'react';
import { useJournalAccounts } from '@/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts';
import { NotFound } from '@/components/ErrorPage/NotFound';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { formatCurrency } from '@/utils/FormatCurrency';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';
import { DataTable } from 'mantine-datatable';
import { routes } from '@/router/routes';
import { capitalize } from '@/utils/Capitalize';
interface StatusBadgeProps {
    status: 'paid' | 'unpaid' | 'partiallypaid' | 'duedate';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    let badgeColor;
    switch (status.toLowerCase()) {
        case 'paid':
            badgeColor = themeColors.green[6];
            break;
        case 'unpaid':
            badgeColor = themeColors.gray[6];
            break;
        case 'partiallypaid':
            badgeColor = themeColors.orange[6];
            break;
        case 'duedate':
            badgeColor = themeColors.red[6];
            break;
        default:
            badgeColor = themeColors.gray[6];
    }
    return (
        <Badge size="sm" fw={500} variant="light" color={badgeColor}>
            {capitalize(status)}
        </Badge>
    );
};


export default function TableTransactionByContact() {
    const navigate = useNavigate();
    const { accounts, isError, isEmpty } = useJournalAccounts();
    const JournalAccounts = Array.isArray(accounts) ? accounts : [];
    const categoryAccounts = Array.from(new Set(JournalAccounts.map((account) => account.category?.name).filter((name): name is string => Boolean(name))));
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<JournalAccounts[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const { mutate: deleteAccount } = useDeleteJurnalAccount();


    if (isError) {
        return <NotFound />;
    }

    if (isEmpty) {
        return <EmptyState />;
    }

    const accountBankAndCash = JournalAccounts.filter((account) => account.isBankAndCash === true);

    const searchData = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.currentTarget.value);
    };

    const filterData = (value: string | null) => {
        setSelectedCategory(value);
    };

    const handleDeleteAccount = () => {
        const ids = {
            accountIds: selectedRecords.map((item) => item.id),
        };
        deleteAccount(ids);
    };



    const columns = [
        {
            accessor: 'transaction',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.black[9]} >Transaction</Text>,
            render: (element: JournalAccounts) => (
                <Anchor
                    underline="never"
                // onClick={() =>
                //     navigate(routes.Contact.DetailContact.replace(':idAccount', element.id))
                // }
                >
                    <Text c={themeColors.teal[6]} size="sm">
                        Credit Memo #{accountBankAndCash.length}
                    </Text>
                </Anchor>
            ),
        },
        {
            accessor: 'transactionDate',
            title: <Text size="sm" fz={14} fw={500} ta='center' c={themeColors.black[9]} >Transaction Date</Text>,
            render: (element: JournalAccounts) => (
                <Text size="sm" fz={14} fw={400} c={themeColors.black[9]} ta='center'>
                    12/01/2025
                </Text>
            ),
        },
        {
            accessor: 'dueDate',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.black[9]} >Due Date</Text>,
            render: (element: JournalAccounts) => (
                <Text c={themeColors.black[9]} size="sm">
                    15/01/2025
                </Text>
            ),
        },
        {
            accessor: 'Status',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.black[9]} >Status</Text>,
            render: (element: JournalAccounts) => (
                <StatusBadge status="partiallypaid" />
            ),
        },
        {
            accessor: 'balance',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.black[9]} >Balance</Text>,
            render: (element: JournalAccounts) => (
                <Text size="sm" fz={14} fw={400} c={themeColors.black[9]} >{formatCurrency(element.debit || 0)}</Text>
            ),
        },
        {
            accessor: 'action',
            title: <Text size="sm" fz={14} fw={500} ta='center' c={themeColors.black[9]} >Action</Text>,
            render: (element: JournalAccounts) =>
                <Center>
                    <Menu position="bottom-end">
                        <Menu.Target>
                            <ActionIcon bg={themeColors.gray[0]}>
                                <IconDots size={14} color={themeColors.gray[6]} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconInfoCircle style={{ width: rem(14), height: rem(14) }} />}
                                component="a"
                                onClick={() =>
                                    navigate(routes.Contact.DetailContact.replace(':idAccount', element.id))
                                }
                            >
                                Detail
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                component="a"
                                c={themeColors.red[6]}
                                target="_blank"
                            >
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Center>
        }

    ];

    return (
        <Stack gap="md">
            <Flex gap="xs" justify="space-between" align="center" direction="row" wrap="wrap">
                <Grid columns={24} gutter="sm">
                    <Grid.Col span={8}>
                        <TextInput
                            leftSectionPointerEvents="none"
                            leftSection={<IconSearch size={16} />}
                            placeholder="Find Transaction"
                            size='xs'
                            value={searchQuery}
                            onChange={searchData}
                        />
                    </Grid.Col>
                    <Grid.Col span={8}>
                        <Select
                            placeholder="All Type"
                            data={categoryAccounts}
                            value={selectedCategory}
                            onChange={filterData}
                            clearable={!!selectedCategory}
                            defaultValue={"Current Assets"}
                            size='xs'
                            rightSection={!selectedCategory ? <IconChevronDown size={16} /> : null}
                            comboboxProps={{ width: 400, position: 'bottom-start' }}
                        />
                    </Grid.Col>
                    <Grid.Col span={8}>
                        <Select
                            placeholder="All Status"
                            data={categoryAccounts}
                            value={selectedCategory}
                            onChange={filterData}
                            clearable={!!selectedCategory}
                            defaultValue={"Current Assets"}
                            size='xs'
                            rightSection={!selectedCategory ? <IconChevronDown size={16} /> : null}
                            comboboxProps={{ width: 400, position: 'bottom-start' }}
                        />
                    </Grid.Col>
                </Grid>
                <Grid columns={6}>
                    {selectedRecords.length > 0 && (
                        <Grid.Col span={3}>
                            <Button
                                onClick={handleDeleteAccount}
                                color={themeColors.red[6]}
                                size='xs'
                                leftSection={<IconTrash size={16}
                                />}
                            >
                                Delete Account
                            </Button>
                        </Grid.Col>
                    )}
                </Grid>
            </Flex>
            <>
                {isEmpty ? (
                    <>
                        <Container fluid p='xl'>
                            <EmptyState />
                        </Container>
                    </>
                ) : (
                    <DataTable
                        withTableBorder
                        borderRadius="md"
                        highlightOnHover
                        fz="sm"
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={setSelectedRecords}
                        columns={columns}
                        records={accountBankAndCash}
                    />
                )
                }
            </>
        </Stack>
    );
}

