import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Group,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconExternalLink, IconSearch, IconX } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import type { GeneralLedgerAccount } from '@/module/reports/domain/generalLedger.types';
import { displayDate, formatCount, formatMoney } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';

const ROWS_PER_PAGE = 25;

interface GeneralLedgerTransactionsTableProps {
  account: GeneralLedgerAccount;
}

/** Movement table of one account: search, sort, 25 rows per page and the period totals. */
export const GeneralLedgerTransactionsTable: React.FC<GeneralLedgerTransactionsTableProps> = ({
  account,
}) => {
  const { t } = useTranslation('reports');
  const [page, setPage] = useState(1);
  const [transactionSearch, onTransactionSearchChange] = useState('');
  const [transactionSort, onTransactionSortChange] = useState<'asc' | 'desc'>('asc');

  const transactions = useMemo(() => {
    const term = transactionSearch.trim().toLowerCase();
    const list = term
      ? account.transactions.filter(
          (tx) =>
            tx.transactionNumber.toLowerCase().includes(term) ||
            tx.description.toLowerCase().includes(term)
        )
      : [...account.transactions];
    return list.sort((a, b) =>
      transactionSort === 'asc'
        ? a.transactionDate.localeCompare(b.transactionDate)
        : b.transactionDate.localeCompare(a.transactionDate)
    );
  }, [account.transactions, transactionSearch, transactionSort]);

  useEffect(() => {
    setPage(1);
  }, [account.id, transactionSearch, transactionSort]);

  const pageCount = Math.max(1, Math.ceil(transactions.length / ROWS_PER_PAGE));
  const visible = transactions.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="xs" align="center">
          <Text fw={700} fz="sm" c="dark.9">
            {t('generalLedger.movementDetail')}
          </Text>
          <Text fz="xs" c="dimmed">
            {formatCount(transactions.length)} {t('generalLedger.movementsShown')}
          </Text>
        </Group>

        <Group gap="xs">
          <TextInput
            placeholder={t('generalLedger.searchTransactions')}
            aria-label={t('generalLedger.searchTransactions')}
            radius="md"
            leftSection={<IconSearch size={14} />}
            rightSection={
              transactionSearch ? (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  aria-label={t('common.resetSearch')}
                  onClick={() => onTransactionSearchChange('')}
                >
                  <IconX size={13} />
                </ActionIcon>
              ) : null
            }
            value={transactionSearch}
            onChange={(event) => onTransactionSearchChange(event.currentTarget.value)}
            w={{ base: '100%', xs: 240 }}
          />
          <Select
            radius="md"
            value={transactionSort}
            onChange={(value) => onTransactionSortChange((value as 'asc' | 'desc') || 'asc')}
            allowDeselect={false}
            aria-label={t('generalLedger.sortOldest')}
            data={[
              { value: 'asc', label: t('generalLedger.sortOldest') },
              { value: 'desc', label: t('generalLedger.sortNewest') },
            ]}
            w={220}
          />
        </Group>
      </Group>

      <ScrollArea offsetScrollbars>
        <Table verticalSpacing={10} horizontalSpacing="sm" highlightOnHover miw={760}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={100} fz="xs" c="dimmed" fw={600}>
                {t('common.date')}
              </Table.Th>
              <Table.Th w={130} fz="xs" c="dimmed" fw={600}>
                {t('generalLedger.colReference')}
              </Table.Th>
              <Table.Th fz="xs" c="dimmed" fw={600}>
                {t('generalLedger.colDescription')}
              </Table.Th>
              <Table.Th ta="right" w={140} fz="xs" c="dimmed" fw={600}>
                {t('common.debit')}
              </Table.Th>
              <Table.Th ta="right" w={140} fz="xs" c="dimmed" fw={600}>
                {t('common.creditId')}
              </Table.Th>
              <Table.Th ta="right" w={150} fz="xs" c="dimmed" fw={600}>
                {t('generalLedger.colRunningBalance')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {visible.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <EmptyState
                    title={t('generalLedger.noMovements')}
                    description={
                      transactionSearch
                        ? t('generalLedger.noTransactionMatch', { query: transactionSearch })
                        : t('generalLedger.noMovementsDescription')
                    }
                    py={36}
                  />
                </Table.Td>
              </Table.Tr>
            ) : (
              visible.map((tx, index) => (
                <Table.Tr key={`${tx.journalId}-${tx.transactionNumber}-${index}`}>
                  <Table.Td>
                    <Text fz="sm" c="dark.8">
                      {displayDate(tx.transactionDate)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {tx.journalId ? (
                      <Tooltip label={t('generalLedger.viewJournalDetail')}>
                        <Text
                          component={Link}
                          to={`/general-journal/detail-transaction-journal/${tx.journalId}`}
                          fz="sm"
                          fw={600}
                          c="primary.7"
                          style={{
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span>{tx.transactionNumber}</span>
                          <IconExternalLink size={13} />
                        </Text>
                      </Tooltip>
                    ) : (
                      <Text fz="sm" fw={600} c="dark.8">
                        {tx.transactionNumber}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm" c="dark.9">
                      {tx.description || '-'}
                    </Text>
                    {tx.notes && tx.notes !== tx.description && (
                      <Text fz="xs" c="dimmed" lineClamp={1} title={tx.notes}>
                        {tx.notes}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text
                      fz="sm"
                      fw={tx.debit > 0 ? 600 : 400}
                      c={tx.debit > 0 ? 'dark.9' : 'dimmed'}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {tx.debit > 0 ? formatMoney(tx.debit) : '–'}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text
                      fz="sm"
                      fw={tx.credit > 0 ? 600 : 400}
                      c={tx.credit > 0 ? 'dark.9' : 'dimmed'}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {tx.credit > 0 ? formatMoney(tx.credit) : '–'}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text
                      fz="sm"
                      fw={600}
                      c={tx.balance < 0 ? 'red.7' : 'dark.9'}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatMoney(tx.balance)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>

          {transactions.length > 0 && (
            <Table.Tfoot>
              <Table.Tr style={{ borderTop: '2px solid var(--mantine-color-gray-3)' }}>
                <Table.Td colSpan={3}>
                  <Text fz="sm" fw={700} c="dark.9">
                    {t('generalLedger.periodTotal')}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text fz="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(account.periodDebit)}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text fz="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(account.periodCredit)}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text
                    fz="sm"
                    fw={700}
                    c="primary.9"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatMoney(account.closingBalance)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          )}
        </Table>
      </ScrollArea>

      {pageCount > 1 && (
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Text fz="xs" c="dimmed">
            {t('generalLedger.pagerSummary', {
              from: formatCount((page - 1) * ROWS_PER_PAGE + 1),
              to: formatCount(Math.min(page * ROWS_PER_PAGE, transactions.length)),
              total: formatCount(transactions.length),
            })}
          </Text>
          <Pagination
            size="sm"
            radius="md"
            color="primary"
            total={pageCount}
            value={page}
            onChange={setPage}
            siblings={1}
          />
        </Group>
      )}
    </Stack>
  );
};
