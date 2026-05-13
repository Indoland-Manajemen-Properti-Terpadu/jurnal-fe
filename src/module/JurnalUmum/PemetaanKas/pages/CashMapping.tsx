import { useState } from 'react';
import { Text, Stack, Container, Select } from '@mantine/core';
import { useNavigate } from 'react-router';
import { themeColors } from '@/theme';
import { formatCurrency } from '@/utils/FormatCurrency';
import { IconChevronDown } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { useJournalAccounts } from '@/module/JurnalUmum/AkunJurnal/hooks/useJournalAccounts';

const elements: JournalTransactionTable[] = [
    { id: 1, transaction: 'Journal Transaction #1', date: '15/08/24', received: 200000, sent: 50000, balance: 150000, description: 'Transfer BI Fast Dari Mandiri' },
    { id: 2, transaction: 'Journal Transaction #2', date: '15/08/24', received: 200000, sent: 50000, balance: 150000, description: 'Transfer BI Fast Dari BCA' },
    { id: 3, transaction: 'Journal Transaction #3', date: '15/08/24', received: 200000, sent: 50000, balance: 150000, description: 'Transfer BI Fast Dari BNI' },
    { id: 4, transaction: 'Journal Transaction #4', date: '15/08/24', received: 200000, sent: 50000, balance: 150000, description: 'Penarikan tunai di BANK BCA JKT' },
    { id: 5, transaction: 'Journal Transaction #5', date: '15/08/24', received: 200000, sent: 50000, balance: 150000, description: 'Penarikan tunai di BANK BCA JKT' },
];



export default function CashMapping() {
    const navigate = useNavigate();
    const [selectedRecords, setSelectedRecords] = useState<JournalTransactionTable[]>([]);
    const { accounts } = useJournalAccounts();
    const JournalAccounts = Array.isArray(accounts) ? accounts : [];
    const listJournalAccount = JournalAccounts
        .filter(account => account.name && account.accountNumber && account.category)
        .map(account => `${account.name} (${account.accountNumber} - ${account.category})`);

    const columns = [
        {
            accessor: 'transactionDate',
            title: 'Transaction Date',
            width: 200,
            render: (element: JournalTransactionTable) =>
                <Text c={themeColors.defaultBlack[10]} fz={14}>{element.date}</Text>
        },
        {
            accessor: 'received',
            title: 'Received',
            render: (element: JournalTransactionTable) => <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(element.received)}</Text>,
        },
        {
            accessor: 'sent',
            title: 'Sent',
            render: (element: JournalTransactionTable) => <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(element.sent)}</Text>,
        },
        {
            accessor: 'description',
            title: 'Description',
            width: 300,
            render: (element: JournalTransactionTable) => <Text c={themeColors.defaultBlack[10]} fz={14}>{element.description}</Text>,
        },
        {
            accessor: 'account',
            title: 'Account',
            width: 300,
            render: (element: JournalTransactionTable) =>
                <Select
                    key='accounts'
                    placeholder="Choose account"
                    checkIconPosition='right'
                    data={listJournalAccount}
                    rightSection={<IconChevronDown size={14} />}
                    // value={item.account}
                    // onChange={(value) => updateTransaction(index, 'account', value)}
                    // withAsterisk
                    comboboxProps={{ width: 500, position: 'bottom-start' }}
                />
        },
        {
            accessor: 'tax',
            title: 'Tax',
            width: 200,
            render: (element: JournalTransactionTable) =>
                <Select
                    key='accounts'
                    placeholder="Choose Tax"
                    checkIconPosition='right'
                    data={["PPH", "PPN", "PPNBM", "PBB", "Bea Materai"]}
                    rightSection={<IconChevronDown size={14} />}
                // value={item.account}
                // onChange={(value) => updateTransaction(index, 'account', value)}
                // withAsterisk
                // comboboxProps={{ width: 500, position: 'bottom-start' }}
                />
        },

    ];

    return (
        <Stack>
            {elements.length === 0 ? (
                <Container fluid p='xl'>
                    <Stack gap='md'>
                        <EmptyState />
                    </Stack>
                </Container>
            ) : (
                <DataTable
                    withTableBorder
                    borderRadius="md"
                    striped
                    highlightOnHover
                    fz="sm"
                    selectedRecords={selectedRecords}
                    onSelectedRecordsChange={setSelectedRecords}
                    columns={columns}
                    records={elements}
                />
            )}
        </Stack>
    );
}