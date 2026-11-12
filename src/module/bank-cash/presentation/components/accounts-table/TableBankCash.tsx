import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Group,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconCoins, IconPlus, IconRefresh, IconSearch, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import type { JournalAccounts } from '@/module/chart-of-accounts';
import {
  flattenCashBankAccounts,
  transactionBlock,
  type CashBankAccount,
  type PettyCashAccountIndex,
} from '@/module/bank-cash/domain/cashBankAccounts';
import { useTranslation } from '@/i18n';
import { BankCashAccountRow } from '@/module/bank-cash/presentation/components/accounts-table/BankCashAccountRow';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import classes from '@/module/bank-cash/presentation/components/accounts-table/TableBankCash.module.css';

export type TableBankCashProps = {
  /** The account tree as `GET /v1/accounts` returns it. */
  accounts: JournalAccounts[];
  pettyCashIndex: PettyCashAccountIndex;
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  loading?: boolean;
  onRefresh?: () => void;
};

const PAGE_SIZE = 10;
const BASE_COLUMNS = 4;

type SortKey = 'highestBalance' | 'lowestBalance' | 'codeAsc' | 'nameAsc';

const compareBy = (sortBy: SortKey) => (a: CashBankAccount, b: CashBankAccount) => {
  if (sortBy === 'highestBalance') return (Number(b.amount) || 0) - (Number(a.amount) || 0);
  if (sortBy === 'lowestBalance') return (Number(a.amount) || 0) - (Number(b.amount) || 0);
  if (sortBy === 'nameAsc') return (a.name || '').localeCompare(b.name || '');
  return (a.accountNumber || '').localeCompare(b.accountNumber || '', undefined, { numeric: true });
};

export const TableBankCash: React.FC<TableBankCashProps> = ({
  accounts = [],
  pettyCashIndex,
  showArchived,
  onShowArchivedChange,
  loading = false,
  onRefresh,
}) => {
  const { t: tb } = useTranslation('bankCash');
  const navigate = useNavigate();
  const { t } = useTranslation('journal');
  const { t: tc } = useTranslation('bankConnection');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('codeAsc');
  const [page, setPage] = useState(1);

  const flattened = useMemo(() => flattenCashBankAccounts(accounts), [accounts]);
  const allAccounts = useMemo(
    () => flattened.filter((account) => showArchived || !account.isArchived),
    [flattened, showArchived]
  );

  // The bank columns appear only once the backend reports a connection on some account.
  const showConnection = useMemo(
    () => allAccounts.some((account) => Boolean(account.bankConnection)),
    [allAccounts]
  );
  const columns = BASE_COLUMNS + (showConnection ? 2 : 0);

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const groups = [...new Set(allAccounts.map((account) => account.groupName))];
    const matches = allAccounts.filter(
      (account) =>
        !q ||
        (account.name || '').toLowerCase().includes(q) ||
        (account.accountNumber || '').toLowerCase().includes(q)
    );
    const byGroup = (account: CashBankAccount) => groups.indexOf(account.groupName);
    return matches.sort((a, b) => byGroup(a) - byGroup(b) || compareBy(sortBy)(a, b));
  }, [allAccounts, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAccounts.length / PAGE_SIZE) || 1;
  const pageAccounts = useMemo(
    () => filteredAccounts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredAccounts, page]
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSortBy('codeAsc');
    setPage(1);
  };

  const renderRows = () => {
    let lastGroup: string | null | undefined;
    return pageAccounts.flatMap((account) => {
      const rows: React.ReactNode[] = [];
      if (account.groupName && account.groupName !== lastGroup) {
        rows.push(
          <Table.Tr key={`group-${account.groupName}`} className={classes.groupRow}>
            <Table.Td colSpan={columns}>
              <Text size="sm" fw={700} c="dark.8">
                {account.groupName}
              </Text>
            </Table.Td>
          </Table.Tr>
        );
      }
      lastGroup = account.groupName;
      rows.push(
        <BankCashAccountRow
          key={account.id}
          account={account}
          block={transactionBlock(account, pettyCashIndex)}
          fundId={pettyCashIndex.get(account.id)?.fundId}
          showConnection={showConnection}
        />
      );
      return rows;
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
        <Box>
          <Text fz="md" fw={650} c="dark.9">
            {t('cashBankAccountList')}
          </Text>
          <Text fz="xs" c="dimmed" mt={3}>
            {t('cashBankAccountListDescription')}
          </Text>
        </Box>

        {onRefresh && (
          <Tooltip label={tb('list.refresh')} withArrow>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={onRefresh}
              loading={loading}
              aria-label={tb('list.refresh')}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Group className={classes.toolbar} justify="space-between" align="flex-end" wrap="wrap">
        <Switch
          checked={showArchived}
          onChange={(event) => {
            onShowArchivedChange(event.currentTarget.checked);
            setPage(1);
          }}
          label={tb('list.showArchived')}
        />

        <Group gap="xs" style={{ flex: 1, minWidth: 280, justifyContent: 'flex-end' }}>
          <TextInput
            placeholder={t('searchAccountPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
              setPage(1);
            }}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="gray"
                  aria-label={tb('list.clearSearch')}
                  onClick={() => setSearchQuery('')}
                >
                  <IconX size={12} />
                </ActionIcon>
              ) : null
            }
            radius="md"
            size="sm"
            style={{ flex: 1, maxWidth: 360 }}
          />

          <Select
            value={sortBy}
            onChange={(val) => setSortBy((val as SortKey) || 'codeAsc')}
            data={[
              { value: 'codeAsc', label: t('sortCodeAsc') },
              { value: 'nameAsc', label: t('sortNameAsc') },
              { value: 'highestBalance', label: t('sortHighestBalance') },
              { value: 'lowestBalance', label: t('sortLowestBalance') },
            ]}
            allowDeselect={false}
            radius="md"
            size="sm"
            w={180}
            comboboxProps={{ position: 'bottom-end', shadow: 'md' }}
          />
        </Group>
      </Group>

      <Box className={classes.tableFrame}>
        <Table
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          style={{ minWidth: 640 }}
        >
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: '16%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {tb('list.columnCode')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '44%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {tb('list.columnName')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '28%', textAlign: 'right' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {tb('list.columnBalance')}
                </Text>
              </Table.Th>
              {showConnection && (
                <>
                  <Table.Th style={{ textAlign: 'right' }}>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                      {tc('list.statementBalance')}
                    </Text>
                  </Table.Th>
                  <Table.Th>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                      {tc('list.connection')}
                    </Text>
                  </Table.Th>
                </>
              )}
              <Table.Th style={{ width: '12%', textAlign: 'center' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('columnAction')}
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <Table.Tr key={`skel-row-${idx}`}>
                  <Table.Td>
                    <Skeleton height={14} width="60%" radius="sm" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={14} width="70%" radius="sm" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={16} width="80%" radius="sm" ml="auto" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton circle height={28} width={28} mx="auto" />
                  </Table.Td>
                </Table.Tr>
              ))
            ) : pageAccounts.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns} p={0}>
                  {flattened.length === 0 ? (
                    <EmptyState
                      title={t('noAccountsYet')}
                      description={t('noAccountsYetDesc')}
                      icon={<IconCoins size={36} stroke={1.5} />}
                      actionLabel={t('addCashBankAccount')}
                      actionIcon={<IconPlus size={14} />}
                      onAction={() => navigate(routes.chartOfAccounts.add)}
                      py={48}
                    />
                  ) : (
                    <EmptyState
                      title={tb('list.noMatch')}
                      description={tb('list.noMatchDesc')}
                      icon={<IconSearch size={36} stroke={1.5} />}
                      actionLabel={t('resetFilter')}
                      onAction={handleResetFilters}
                      py={48}
                    />
                  )}
                </Table.Td>
              </Table.Tr>
            ) : (
              renderRows()
            )}
          </Table.Tbody>
        </Table>
      </Box>

      {filteredAccounts.length > 0 && (
        <Group justify="space-between" align="center" wrap="wrap" mt="xs">
          <Text size="xs" c="dimmed">
            {tb('table.showing')}{' '}
            <Text span fw={600} c="dark.7">
              {Math.min((page - 1) * PAGE_SIZE + 1, filteredAccounts.length)}
            </Text>{' '}
            -{' '}
            <Text span fw={600} c="dark.7">
              {Math.min(page * PAGE_SIZE, filteredAccounts.length)}
            </Text>{' '}
            {tb('table.of')}{' '}
            <Text span fw={600} c="dark.7">
              {filteredAccounts.length}
            </Text>{' '}
            {tb('table.accountsLabel')}
          </Text>

          {totalPages > 1 && (
            <Pagination
              value={page}
              onChange={setPage}
              total={totalPages}
              radius="md"
              size="sm"
              color="primary"
            />
          )}
        </Group>
      )}
    </Stack>
  );
};

export default TableBankCash;
