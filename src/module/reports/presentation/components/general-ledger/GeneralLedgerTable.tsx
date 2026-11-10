import React, { useMemo, useState } from 'react';
import { Box, Group, Pagination, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { groupByAccountClass } from '@/module/reports/domain/accountClass';
import type { GeneralLedgerAccount } from '@/module/reports/domain/generalLedger.types';
import { displayDate, formatAmount, formatCount } from '@/module/reports/domain/reportFormat';
import { useTranslation } from '@/i18n';
import classes from './GeneralLedger.module.css';

/** Transactions shown at once for one account; a busy account has thousands in a period. */
const ROWS_PER_PAGE = 25;

interface GeneralLedgerTableProps {
  accounts: GeneralLedgerAccount[];
  search: string;
  onSearchChange: (search: string) => void;
}

/** Negative balances show in parentheses and red, as in a printed ledger. */
const signed = (value: number) =>
  value < 0 ? `(${formatAmount(Math.abs(value))})` : formatAmount(value);

/** A debit or credit figure: zero is shown but muted. */
const Figure: React.FC<{ value: number }> = ({ value }) => (
  <td data-num="" data-zero={value === 0 ? '' : undefined}>
    {formatAmount(value)}
  </td>
);

/** A balance, negative ones in parentheses and red. */
const Balance: React.FC<{ value: number; strong?: boolean }> = ({ value, strong }) => (
  <td data-num="" data-balance={strong ? 'strong' : ''} data-negative={value < 0 ? '' : undefined}>
    {signed(value)}
  </td>
);

/**
 * The general ledger as one table, the way a printed ledger reads: under the name of its class,
 * every account is a section with its opening balance, its transactions with the running
 * balance, and a closing line with the period's debit, credit and the closing balance. The
 * transactions of one account are paged (25 at a time) because some accounts have thousands.
 */
export const GeneralLedgerTable: React.FC<GeneralLedgerTableProps> = ({
  accounts,
  search,
  onSearchChange,
}) => {
  const { t } = useTranslation('reports');
  const [pages, setPages] = useState<Record<string, number>>({});
  const groups = useMemo(
    () => groupByAccountClass(accounts, (account) => account.number),
    [accounts]
  );

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="md">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="xs">
          <Box>
            <Text fw={600} fz="md" c="dark.9">
              {t('generalLedger.tableTitle')}
            </Text>
            <Text fz="xs" c="dimmed">
              {t('generalLedger.tableHint')}
            </Text>
          </Box>
          <Text fz="xs" c="dimmed" fw={600}>
            {t('generalLedger.unitNote')}
          </Text>
        </Group>

        <div className={classes.frame}>
          <table className={classes.table}>
            <colgroup>
              <col className={classes.colDate} />
              <col className={classes.colRef} />
              <col />
              <col className={classes.colAmount} />
              <col className={classes.colAmount} />
              <col className={classes.colBalance} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">{t('common.date')}</th>
                <th scope="col">{t('generalLedger.colReference')}</th>
                <th scope="col">{t('generalLedger.colDescription')}</th>
                <th scope="col">{t('common.debit')}</th>
                <th scope="col">{t('common.creditId')}</th>
                <th scope="col">{t('generalLedger.colRunningBalance')}</th>
              </tr>
            </thead>

            {accounts.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title={t('generalLedger.accountNotFound')}
                      description={t('generalLedger.noAccountMatch', { query: search })}
                      actionLabel={t('common.resetSearch')}
                      onAction={() => onSearchChange('')}
                      py={40}
                    />
                  </td>
                </tr>
              </tbody>
            )}

            {groups.map((group) => (
              <React.Fragment key={group.key}>
                <tbody>
                  <tr className={classes.classRow}>
                    <td colSpan={6}>{t(`common.accountClass${group.key}`)}</td>
                  </tr>
                </tbody>

                {group.items.map((account) => {
                  const pageCount = Math.max(
                    1,
                    Math.ceil(account.transactions.length / ROWS_PER_PAGE)
                  );
                  const page = Math.min(pages[account.id] ?? 1, pageCount);
                  const first = (page - 1) * ROWS_PER_PAGE;
                  const visible = account.transactions.slice(first, first + ROWS_PER_PAGE);

                  return (
                    <tbody key={account.id}>
                      <tr className={classes.accountRow}>
                        <td colSpan={6}>
                          <span className={classes.accountNumber}>({account.number})</span>{' '}
                          {account.name}
                          {account.isContra && (
                            <span className={classes.contra}>
                              {t('generalLedger.contraAccount')}
                            </span>
                          )}
                        </td>
                      </tr>

                      <tr className={classes.openingRow}>
                        <td colSpan={5}>{t('generalLedger.openingBalance')}</td>
                        <Balance value={account.openingBalance} strong />
                      </tr>

                      {visible.map((tx, index) => (
                        <tr key={`${tx.journalId}-${tx.transactionNumber}-${first + index}`}>
                          <td>{displayDate(tx.transactionDate)}</td>
                          <td>
                            {tx.journalId ? (
                              <Tooltip label={t('generalLedger.viewJournalDetail')}>
                                <Link
                                  className={classes.ref}
                                  to={`/general-journal/detail-transaction-journal/${tx.journalId}`}
                                >
                                  {tx.transactionNumber}
                                </Link>
                              </Tooltip>
                            ) : (
                              <span>{tx.transactionNumber}</span>
                            )}
                          </td>
                          <td>
                            <div className={classes.description}>{tx.description || '-'}</div>
                            {tx.notes && tx.notes !== tx.description && (
                              <div className={classes.notes} title={tx.notes}>
                                {tx.notes}
                              </div>
                            )}
                          </td>
                          <Figure value={tx.debit} />
                          <Figure value={tx.credit} />
                          <Balance value={tx.balance} />
                        </tr>
                      ))}

                      {pageCount > 1 && (
                        <tr className={classes.pagerRow}>
                          <td colSpan={6}>
                            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                              <Text fz="xs" c="dimmed">
                                {t('generalLedger.pagerSummary', {
                                  from: formatCount(first + 1),
                                  to: formatCount(
                                    Math.min(first + ROWS_PER_PAGE, account.transactions.length)
                                  ),
                                  total: formatCount(account.transactions.length),
                                })}
                              </Text>
                              <Pagination
                                size="xs"
                                radius="md"
                                color="primary"
                                total={pageCount}
                                value={page}
                                onChange={(next) =>
                                  setPages((current) => ({ ...current, [account.id]: next }))
                                }
                                siblings={1}
                              />
                            </Group>
                          </td>
                        </tr>
                      )}

                      <tr className={classes.closingRow}>
                        <td colSpan={3}>
                          {account.name} | {t('generalLedger.closingBalance')}
                        </td>
                        <Figure value={account.periodDebit} />
                        <Figure value={account.periodCredit} />
                        <Balance value={account.closingBalance} strong />
                      </tr>
                    </tbody>
                  );
                })}
              </React.Fragment>
            ))}
          </table>
        </div>

        <Text fz="xs" c="dimmed">
          {t('generalLedger.accountsShown', { count: formatCount(accounts.length) })}
        </Text>
      </Stack>
    </Paper>
  );
};
