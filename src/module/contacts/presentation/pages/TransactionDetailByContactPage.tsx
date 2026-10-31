import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Tabs,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { useTranslation } from '@/i18n';
import {
  TRANSACTION_STATUS_FILTERS,
  filterSalesByStatus,
  summarizeSales,
  type TransactionStatusFilter,
} from '@/module/contacts/domain/contactTransactions';
import { ContactSummaryHero } from '@/module/contacts/presentation/components/transactions/ContactSummaryHero';
import { TransactionActionBar } from '@/module/contacts/presentation/components/transactions/TransactionActionBar';
import { TransactionKpiCards } from '@/module/contacts/presentation/components/transactions/TransactionKpiCards';
import { TableTransactionByContact } from '@/module/contacts/presentation/components/tables/TableTransactionByContact';
import {
  useContact,
  useContactTransactions,
  useExportContactTransactions,
} from '@/module/contacts/presentation/hooks/useContactQueries';

export function TransactionDetailByContactPage() {
  const { idAccount } = useParams<{ idAccount: string }>();
  const { t } = useTranslation('contacts');

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);
  const [activeTab, setActiveTab] = useState<TransactionStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Queries
  const { data: contact, isLoading: isContactLoading } = useContact(idAccount);
  const transactionsQuery = useContactTransactions(idAccount, {
    page: 1,
    limit: 100,
    search: debouncedSearch.trim() || undefined,
  });
  const exportMutation = useExportContactTransactions(idAccount);

  const rawTransactionsList = transactionsQuery.data?.items ?? [];

  // Filter client-side to guarantee accuracy for calculated states like OVERDUE and case-insensitive DRAFT
  const filteredTransactions = useMemo(
    () => filterSalesByStatus(rawTransactionsList, activeTab),
    [rawTransactionsList, activeTab]
  );

  const totalFiltered = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));

  const paginatedList = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredTransactions.slice(start, start + limit);
  }, [filteredTransactions, page, limit]);

  const totals = useMemo(() => summarizeSales(rawTransactionsList), [rawTransactionsList]);

  const handleTabChange = (value: string | null) => {
    setActiveTab((value ?? 'all') as TransactionStatusFilter);
    setPage(1);
  };

  const handleExport = () => {
    if (!idAccount) return;
    exportMutation.mutate();
  };

  if (isContactLoading) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={50} radius="md" />
            <Skeleton height={140} radius="lg" />
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <Skeleton height={90} radius="md" />
              <Skeleton height={90} radius="md" />
              <Skeleton height={90} radius="md" />
              <Skeleton height={90} radius="md" />
            </SimpleGrid>
            <Skeleton height={400} radius="md" />
          </Stack>
        </Box>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <TransactionActionBar
            contactId={idAccount}
            isRefreshing={transactionsQuery.isFetching}
            isExporting={exportMutation.isPending}
            onRefresh={() => transactionsQuery.refetch()}
            onExport={handleExport}
          />

          <ContactSummaryHero
            contact={contact}
            outstanding={totals.remainingSum}
            transactionCount={rawTransactionsList.length}
          />

          <TransactionKpiCards totals={totals} count={rawTransactionsList.length} />

          {/* Main Transactions Section with Tabs & Search */}
          <Paper withBorder radius="lg" p="md" bg="white">
            <Stack gap="md">
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                color="primary"
                variant="pills"
                radius="md"
              >
                <Group justify="space-between" align="center" wrap="wrap" gap="sm" mb="md">
                  <Tabs.List>
                    {TRANSACTION_STATUS_FILTERS.map((value) => (
                      <Tabs.Tab key={value} value={value}>
                        {t(`transactions.tabs.${value}`)}
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>

                  <TextInput
                    placeholder={t('transactions.searchPlaceholder')}
                    leftSection={<IconSearch size={16} />}
                    rightSection={
                      searchInput ? (
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={() => setSearchInput('')}
                          aria-label={t('transactions.clearSearch')}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      ) : null
                    }
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.currentTarget.value);
                      setPage(1);
                    }}
                    w={{ base: '100%', sm: 320 }}
                  />
                </Group>

                <TableTransactionByContact
                  transactions={paginatedList}
                  isLoading={transactionsQuery.isLoading}
                  page={page}
                  limit={limit}
                  total={totalFiltered}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                />
              </Tabs>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default TransactionDetailByContactPage;
