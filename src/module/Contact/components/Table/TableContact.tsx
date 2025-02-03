

import { ActionIcon, Anchor, Button, Center, Checkbox, Text, Flex, Grid, Menu, Paper, PaperProps, rem, Select, Stack, TextInput, Container } from '@mantine/core';
import { themeColors } from '@/theme';
import { IconChevronDown, IconDots, IconInfoCircle, IconSearch, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteJurnalAccount } from '@/module/GeneralJournal/JournalAccount/service/DeleteTransaction.service';
import { useState } from 'react';
import { GetJournalAccounts } from '@/module/GeneralJournal/JournalAccount/service/AccountJournal.service';
import { NotFound } from '@/components/ErrorPage/NotFound';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { formatCurrency } from '@/utils/FormatCurrency';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';
import { DataTable } from 'mantine-datatable';
import { routes } from '@/router';


const PAPER_PROPS: PaperProps = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};


export default function TableContact() {
    const navigate = useNavigate();
    const { accounts, isError, isEmpty } = GetJournalAccounts();
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
            accessor: 'transactionName',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Contact Name</Text>,
            render: (element: JournalAccounts) => (
                <Anchor
                    underline="never"
                    onClick={() =>
                        navigate(routes.Contact.DetailContact.replace(':idAccount', element.id))
                    }>
                    <Text c={themeColors.primary[6]} size="sm">
                        Aditya Santoso
                    </Text>
                </Anchor>
            ),
        },
        {
            accessor: 'transactionDate',
            title: <Text size="sm" fz={14} fw={500} ta='center' c={themeColors.defaultBlack[10]} >Type</Text>,
            render: (element: JournalAccounts) => (
                <Text size="sm" fz={14} fw={400} c={themeColors.defaultBlack[10]} ta='center'>
                    Other
                </Text>
            ),
        },
        {
            accessor: 'transactionName',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Company Name</Text>,
            render: (element: JournalAccounts) => (
                <Text c={themeColors.defaultBlack[10]} size="sm">
                    PT. Sinar Jaya
                </Text>
            ),
        },
        {
            accessor: 'transactionName',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Email</Text>,
            render: (element: JournalAccounts) => (
                <Text c={themeColors.defaultBlack[10]} size="sm">
                    Sinarjaya@company.id
                </Text>
            ),
        },
        {
            accessor: 'credit',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Phone Number</Text>,
            render: (element: JournalAccounts) => (
                <Text size="sm" fz={14} fw={400} c={themeColors.defaultBlack[10]} >0877818472723</Text>
            ),
        },
        {
            accessor: 'balance',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Balance</Text>,
            render: (element: JournalAccounts) => (
                <Text size="sm" fz={14} fw={400} c={themeColors.defaultBlack[10]} >{formatCurrency(element.debit || 0)}</Text>
            ),
        },
        {
            accessor: 'action',
            title: <Text size="sm" fz={14} fw={500} ta='center' c={themeColors.defaultBlack[10]} >Action</Text>,
            render: (element: JournalAccounts) =>
                <Center>
                    <Menu position="bottom-end">
                        <Menu.Target>
                            <ActionIcon bg={themeColors.grey[0]}>
                                <IconDots size={14} color={themeColors.grey[6]} />
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
        <Paper {...PAPER_PROPS}>
            <Stack gap="lg">
                <Flex gap="xs" justify="space-between" align="center" direction="row" wrap="wrap">
                    <Grid columns={24} gutter="sm">
                        <Grid.Col span={8}>
                            <TextInput
                                leftSectionPointerEvents="none"
                                leftSection={<IconSearch size={16} />}
                                placeholder="Find Account"
                                size='xs'
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
                                defaultValue={"Current Assets"}
                                size='xs'
                                rightSection={!selectedCategory ? <IconChevronDown size={16} /> : null}
                                comboboxProps={{ width: 400, position: 'bottom-start' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Button variant="default" size='xs'>
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
        </Paper>
    );
}



/* <Table style={{ borderRadius: 8 }} >
                    <Table.Thead>
                        <Table.Tr style={{ ...headTableStyle, fontWeight: 500, fontSize: 14 }}>

                            <Table.Th colSpan={7} ta='left' >Contact Name</Table.Th>
                            <Table.Th colSpan={2} ta='left' >Type</Table.Th>
                            <Table.Th colSpan={2} ta='left' >Company Name</Table.Th>
                            <Table.Th colSpan={2} ta='left' >Email</Table.Th>
                            <Table.Th colSpan={2} ta='left' >Phone Number</Table.Th>
                            <Table.Th colSpan={2} ta='left' >Balance</Table.Th>
                            <Table.Th colSpan={1} ta='center' >Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {accountBankAndCash.map((account) => (
                            <Table.Tr key={account.id} style={rowStyle} >
                                <Table.Td fz={14} colSpan={7} style={{ textAlign: "left", fontWeight: 400 }}>
                                    {account.name} ({account.accountNumber})
                                </Table.Td>
                                <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: 400 }}>
                                    {formatCurrency(account.debit)}
                                </Table.Td>
                                <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: 400 }}>
                                    {formatCurrency(account.amount)}
                                </Table.Td>
                                <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: 400 }}>
                                    {formatCurrency(account.amount)}
                                </Table.Td>
                                <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: 400 }}>
                                    {formatCurrency(account.amount)}
                                </Table.Td>
                                <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: 400 }}>
                                    {formatCurrency(account.amount)}
                                </Table.Td>
                                <Table.Td colSpan={1} style={{ textAlign: "center", fontWeight: 400 }}>
                                    <Menu position="bottom-end">
                                        <Menu.Target>
                                            <ActionIcon bg={themeColors.grey[0]}>
                                                <IconDots size={14} color={themeColors.grey[6]} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconInfoCircle style={{ width: rem(14), height: rem(14) }} />}
                                                component="a"
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
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table> */
{/* <ImportBankStatementModal
                            idAccount={idAccount!}
                            onContinue={handleRefresh}
                            isOpen={isModalOpen}
                            onClose={handleCloseModal}
                        /> */}
