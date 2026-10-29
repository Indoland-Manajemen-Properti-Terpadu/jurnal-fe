import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Menu,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowsExchange,
  IconArrowsShuffle,
  IconArrowUpRight,
  IconBuildingBank,
  IconCoins,
  IconDots,
  IconLock,
  IconPencil,
  IconPlus,
  IconReceipt2,
  IconRefresh,
  IconSearch,
  IconWallet,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/FormatCurrency';
import { JournalAccounts } from '@/module/chart-of-accounts';
import { isBankAccount } from '../StatsBankCashGrid/StatsBankCashGrid';
import { useTranslation } from '@/i18n';
import EmptyState from '@/components/EmptyState/EmptyState';
import classes from './TableBankCash.module.css';

export type TableBankCashProps = {
  accounts: JournalAccounts[];
  loading?: boolean;
  onRefresh?: () => void;
};

const PAGE_SIZE = 10;

export const TableBankCash: React.FC<TableBankCashProps> = ({
  accounts = [],
  loading = false,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('journal');

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('highestBalance');
  const [page, setPage] = useState<number>(1);

  // Filter accounts where isBankAndCash is true
  const cashAndBankAccounts = useMemo(
    () => (accounts || []).filter((account) => account.isBankAndCash),
    [accounts]
  );

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const all = cashAndBankAccounts.length;
    const bank = cashAndBankAccounts.filter(isBankAccount).length;
    const cash = all - bank;
    return { all, bank, cash };
  }, [cashAndBankAccounts]);

  // Filtered and sorted list
  const filteredAccounts = useMemo(() => {
    let result = [...cashAndBankAccounts];

    // Filter by tab category
    if (categoryFilter === 'bank') {
      result = result.filter(isBankAccount);
    } else if (categoryFilter === 'cash') {
      result = result.filter((acc) => !isBankAccount(acc));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((acc) => {
        const name = (acc.name || '').toLowerCase();
        const num = (acc.accountNumber || '').toLowerCase();
        const cat = (acc.category?.name || '').toLowerCase();
        return name.includes(q) || num.includes(q) || cat.includes(q);
      });
    }

    // Sorting
    result.sort((a, b) => {
      const amountA = Number(a.amount) || 0;
      const amountB = Number(b.amount) || 0;
      const numA = a.accountNumber || '';
      const numB = b.accountNumber || '';
      const nameA = a.name || '';
      const nameB = b.name || '';

      if (sortBy === 'highestBalance') return amountB - amountA;
      if (sortBy === 'lowestBalance') return amountA - amountB;
      if (sortBy === 'codeAsc') return numA.localeCompare(numB, undefined, { numeric: true });
      if (sortBy === 'nameAsc') return nameA.localeCompare(nameB);
      return 0;
    });

    return result;
  }, [cashAndBankAccounts, categoryFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAccounts.length / PAGE_SIZE) || 1;
  const paginatedAccounts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAccounts.slice(start, start + PAGE_SIZE);
  }, [filteredAccounts, page]);

  const handleRowClick = (accountId: string) => {
    navigate(routes.generalJournal.detailAccount.replace(':idAccount', accountId));
  };

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setSortBy('highestBalance');
    setPage(1);
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
          <Tooltip label={t('refresh')} withArrow>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={onRefresh}
              loading={loading}
              aria-label={t('refresh')}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Group
        className={classes.toolbar}
        justify="space-between"
        align="flex-end"
        wrap="wrap"
        gap="md"
      >
        <Tabs
          value={categoryFilter}
          onChange={(val) => {
            setCategoryFilter(val || 'all');
            setPage(1);
          }}
          variant="default"
          color="primary"
        >
          <Tabs.List className={classes.categories}>
            <Tabs.Tab value="all">
              {t('allAccounts')} · {categoryCounts.all}
            </Tabs.Tab>
            <Tabs.Tab value="bank">
              {t('bankAccounts')} · {categoryCounts.bank}
            </Tabs.Tab>
            <Tabs.Tab value="cash">
              {t('cashAccounts')} · {categoryCounts.cash}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

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
            onChange={(val) => setSortBy(val || 'highestBalance')}
            data={[
              { value: 'highestBalance', label: t('sortHighestBalance') },
              { value: 'lowestBalance', label: t('sortLowestBalance') },
              { value: 'codeAsc', label: t('sortCodeAsc') },
              { value: 'nameAsc', label: t('sortNameAsc') },
            ]}
            radius="md"
            size="sm"
            w={180}
            comboboxProps={{ position: 'bottom-end', shadow: 'md' }}
          />
        </Group>
      </Group>

      {/* Main Table */}
      <Box className={classes.tableFrame}>
        <Table
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          striped={false}
          style={{ minWidth: 700 }}
        >
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: '35%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('columnAccount')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '18%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('columnAccountType')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '22%', textAlign: 'right' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('columnLedgerBalance')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'center' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('columnReconciliationStatus')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '10%', textAlign: 'center' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('columnAction')}
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <Table.Tr key={`skel-row-${idx}`}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Skeleton circle height={38} width={38} />
                      <Box style={{ flex: 1 }}>
                        <Skeleton height={14} width="70%" radius="sm" mb={6} />
                        <Skeleton height={10} width="40%" radius="sm" />
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={22} width={100} radius="sm" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={16} width="80%" radius="sm" ml="auto" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={22} width={90} radius="sm" mx="auto" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton circle height={28} width={28} mx="auto" />
                  </Table.Td>
                </Table.Tr>
              ))
            ) : paginatedAccounts.length === 0 ? (
              // In-Table Empty State
              <Table.Tr>
                <Table.Td colSpan={5} p={0}>
                  {cashAndBankAccounts.length === 0 ? (
                    <EmptyState
                      title={t('noAccountsYet')}
                      description={t('noAccountsYetDesc')}
                      icon={<IconCoins size={36} stroke={1.5} />}
                      actionLabel={t('addCashBankAccount')}
                      actionIcon={<IconPlus size={14} />}
                      onAction={() => navigate(routes.generalJournal.addAccountJournal)}
                      py={48}
                    />
                  ) : (
                    <EmptyState
                      title={t('noAccountsFound')}
                      description={t('noAccountsFoundDesc')}
                      icon={<IconSearch size={36} stroke={1.5} />}
                      actionLabel={t('resetFilter')}
                      onAction={handleResetFilters}
                      py={48}
                    />
                  )}
                </Table.Td>
              </Table.Tr>
            ) : (
              // Data Rows
              paginatedAccounts.map((account) => {
                const isBank = isBankAccount(account);
                const amount = Number(account.amount) || 0;
                const isOverdraft = amount < 0;

                return (
                  <Table.Tr
                    key={account.id}
                    onClick={() => handleRowClick(account.id)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 150ms ease',
                    }}
                  >
                    {/* Account Name & Code */}
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <Box className={classes.accountIcon} aria-hidden="true">
                          {isBank ? <IconBuildingBank size={18} /> : <IconWallet size={18} />}
                        </Box>

                        <Box style={{ minWidth: 0 }}>
                          <Group gap="xs" wrap="nowrap" align="center">
                            <Text
                              size="sm"
                              fw={600}
                              c="dark.8"
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {account.name}
                            </Text>

                            {account.isArchived && (
                              <Badge size="xs" variant="filled" color="gray" radius="sm">
                                {t('archived')}
                              </Badge>
                            )}
                            {account.isLocked && (
                              <Badge
                                size="xs"
                                variant="light"
                                color="blue"
                                radius="sm"
                                leftSection={<IconLock size={10} />}
                              >
                                {t('locked')}
                              </Badge>
                            )}
                          </Group>

                          <Group gap={6} mt={2} align="center">
                            <Text size="xs" c="dimmed" ff="monospace">
                              {account.accountNumber || '—'}
                            </Text>

                            {account.category?.name && account.category.name !== 'Kas & Bank' && (
                              <Text size="xs" c="dimmed">
                                • {account.category.name}
                              </Text>
                            )}
                          </Group>
                        </Box>
                      </Group>
                    </Table.Td>

                    {/* Account Type */}
                    <Table.Td>
                      <Text size="sm" c="dark.7">
                        {isBank ? t('accountTypeBank') : t('accountTypeCash')}
                      </Text>
                    </Table.Td>

                    {/* Ledger Balance */}
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text
                        fw={700}
                        size="sm"
                        c={isOverdraft ? 'red.7' : 'dark.8'}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatCurrency(amount)}
                      </Text>
                      <Text size="xs" c={isOverdraft ? 'red.6' : 'dimmed'}>
                        {isOverdraft ? t('overdraftWarning') : t('normalBalancePositive')}
                      </Text>
                    </Table.Td>

                    {/* Reconciliation Status */}
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Group gap={7} justify="center" wrap="nowrap">
                        <span
                          className={classes.statusDot}
                          data-tone={isBank ? 'ready' : 'neutral'}
                          aria-hidden="true"
                        />
                        <Text size="xs" c="gray.7" fw={550}>
                          {isBank ? t('reconciledReady') : t('notApplicable')}
                        </Text>
                      </Group>
                    </Table.Td>

                    {/* Quick Action Menu */}
                    <Table.Td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <Menu position="bottom-end" shadow="md" width={220} withArrow>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" radius="md">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Label>{t('actions')}</Menu.Label>

                          <Menu.Item
                            leftSection={<IconReceipt2 size={15} />}
                            onClick={() =>
                              navigate(
                                routes.generalJournal.detailAccount.replace(
                                  ':idAccount',
                                  account.id
                                )
                              )
                            }
                          >
                            {t('viewDetailAndMutation')}
                          </Menu.Item>

                          {isBank && (
                            <Menu.Item
                              leftSection={<IconArrowsShuffle size={15} />}
                              onClick={() =>
                                navigate(
                                  `${routes.generalJournal.detailAccount.replace(':idAccount', account.id)}?tab=reconciliation`
                                )
                              }
                            >
                              {t('reconcileBank')}
                            </Menu.Item>
                          )}

                          <Menu.Divider />

                          <Menu.Item
                            leftSection={<IconArrowsExchange size={15} />}
                            onClick={() => navigate(routes.BankAndCash.AddTransferMoney)}
                          >
                            {t('transferFromThis')}
                          </Menu.Item>

                          <Menu.Item
                            leftSection={<IconArrowDownRight size={15} />}
                            onClick={() => navigate(routes.BankAndCash.AddReceiveMoney)}
                          >
                            {t('receiveToThis')}
                          </Menu.Item>

                          <Menu.Item
                            leftSection={<IconArrowUpRight size={15} />}
                            onClick={() => navigate(routes.BankAndCash.AddSentMoney)}
                          >
                            {t('sendFromThis')}
                          </Menu.Item>

                          <Menu.Divider />

                          <Menu.Item
                            leftSection={<IconPencil size={15} />}
                            onClick={() =>
                              navigate(
                                routes.generalJournal.editAccountJournal.replace(
                                  ':idAccount',
                                  account.id
                                )
                              )
                            }
                          >
                            {t('editAccount')}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Pagination & Summary Footer */}
      {filteredAccounts.length > 0 && (
        <Group justify="space-between" align="center" wrap="wrap" mt="xs">
          <Text size="xs" c="dimmed">
            Menampilkan{' '}
            <Text span fw={600} c="dark.7">
              {Math.min((page - 1) * PAGE_SIZE + 1, filteredAccounts.length)}
            </Text>{' '}
            -{' '}
            <Text span fw={600} c="dark.7">
              {Math.min(page * PAGE_SIZE, filteredAccounts.length)}
            </Text>{' '}
            dari{' '}
            <Text span fw={600} c="dark.7">
              {filteredAccounts.length}
            </Text>{' '}
            akun kas & bank
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
