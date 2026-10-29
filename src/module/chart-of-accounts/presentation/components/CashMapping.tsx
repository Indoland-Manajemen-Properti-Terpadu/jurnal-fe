import { useState } from 'react';
import { Text, Stack, Container, Select } from '@mantine/core';
import { useNavigate } from 'react-router';
import { themeColors } from '@/theme';
import { formatCurrency } from '@/utils/FormatCurrency';
import { IconChevronDown } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { useTranslation } from '@/i18n';
import { useJournalAccounts } from '../hooks/useJournalAccounts';

/** Row of the mock mapping table (was an ambient global declared in the old GeneralJournal folder). */
interface JournalTransactionTable {
  id: number;
  transaction: string;
  date: string;
  received: number;
  sent: number;
  balance: number;
  status?: string;
  description?: string;
}

const elements: JournalTransactionTable[] = [
  {
    id: 1,
    transaction: 'Journal Transaction #1',
    date: '15/08/24',
    received: 200000,
    sent: 50000,
    balance: 150000,
    description: 'Transfer BI Fast Dari Mandiri',
  },
  {
    id: 2,
    transaction: 'Journal Transaction #2',
    date: '15/08/24',
    received: 200000,
    sent: 50000,
    balance: 150000,
    description: 'Transfer BI Fast Dari BCA',
  },
  {
    id: 3,
    transaction: 'Journal Transaction #3',
    date: '15/08/24',
    received: 200000,
    sent: 50000,
    balance: 150000,
    description: 'Transfer BI Fast Dari BNI',
  },
  {
    id: 4,
    transaction: 'Journal Transaction #4',
    date: '15/08/24',
    received: 200000,
    sent: 50000,
    balance: 150000,
    description: 'Penarikan tunai di BANK BCA JKT',
  },
  {
    id: 5,
    transaction: 'Journal Transaction #5',
    date: '15/08/24',
    received: 200000,
    sent: 50000,
    balance: 150000,
    description: 'Penarikan tunai di BANK BCA JKT',
  },
];

export default function CashMapping() {
  const navigate = useNavigate();
  const { t } = useTranslation('chartOfAccounts');
  const [selectedRecords, setSelectedRecords] = useState<JournalTransactionTable[]>([]);
  const { accounts } = useJournalAccounts();
  const JournalAccounts = Array.isArray(accounts) ? accounts : [];
  const listJournalAccount = JournalAccounts.filter(
    (account) => account.name && account.accountNumber && account.category
  ).map((account) => `${account.name} (${account.accountNumber} - ${account.category})`);

  const columns = [
    {
      accessor: 'transactionDate',
      title: t('cashMapping.colDate'),
      width: 200,
      render: (element: JournalTransactionTable) => (
        <Text c={themeColors.black[9]} fz={14}>
          {element.date}
        </Text>
      ),
    },
    {
      accessor: 'received',
      title: t('cashMapping.colReceived'),
      render: (element: JournalTransactionTable) => (
        <Text c={themeColors.black[9]} fz={14}>
          {formatCurrency(element.received)}
        </Text>
      ),
    },
    {
      accessor: 'sent',
      title: t('cashMapping.colSent'),
      render: (element: JournalTransactionTable) => (
        <Text c={themeColors.black[9]} fz={14}>
          {formatCurrency(element.sent)}
        </Text>
      ),
    },
    {
      accessor: 'description',
      title: t('cashMapping.colDescription'),
      width: 300,
      render: (element: JournalTransactionTable) => (
        <Text c={themeColors.black[9]} fz={14}>
          {element.description}
        </Text>
      ),
    },
    {
      accessor: 'account',
      title: t('cashMapping.colAccount'),
      width: 300,
      render: (element: JournalTransactionTable) => (
        <Select
          key="accounts"
          placeholder={t('cashMapping.chooseAccount')}
          checkIconPosition="right"
          data={listJournalAccount}
          rightSection={<IconChevronDown size={14} />}
          // value={item.account}
          // onChange={(value) => updateTransaction(index, 'account', value)}
          // withAsterisk
          comboboxProps={{ width: 500, position: 'bottom-start' }}
        />
      ),
    },
    {
      accessor: 'tax',
      title: t('cashMapping.colTax'),
      width: 200,
      render: (element: JournalTransactionTable) => (
        <Select
          key="accounts"
          placeholder={t('cashMapping.chooseTax')}
          checkIconPosition="right"
          data={['PPH', 'PPN', 'PPNBM', 'PBB', t('cashMapping.stampDuty')]}
          rightSection={<IconChevronDown size={14} />}
          // value={item.account}
          // onChange={(value) => updateTransaction(index, 'account', value)}
          // withAsterisk
          // comboboxProps={{ width: 500, position: 'bottom-start' }}
        />
      ),
    },
  ];

  return (
    <Stack>
      {elements.length === 0 ? (
        <Container fluid p="xl">
          <Stack gap="md">
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
