import { Fragment, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Button, Group, Pagination, Paper, Switch, Text, Tooltip } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { ReportPeriod } from '@/module/reports/domain/generalLedger.types';
import type { VisibleLedgerAccount } from '@/module/reports/domain/generalLedgerView';
import { displayLedgerDate, previousLedgerDate } from '@/module/reports/domain/generalLedgerView';
import { formatAmount, formatCount } from '@/module/reports/domain/reportFormat';
import { useReportPrecision } from '@/module/reports/presentation/hooks/useReportPrecision';
import { ReportSearchInput } from '@/module/reports/presentation/components/shared/ReportSearchInput';
import { routes } from '@/router/routes';
import classes from './GeneralLedger.module.css';

const ROWS_PER_PAGE = 25;

interface Props {
  accounts: VisibleLedgerAccount[];
  period: ReportPeriod;
  companyName?: string;
  search: string;
  onSearchChange: (value: string) => void;
  hideWithoutTransactions: boolean;
  onHideWithoutTransactionsChange: (value: boolean) => void;
  debitTotal: number;
  creditTotal: number;
  printMode?: boolean;
}

const isZero = (value: number) => value === 0 || Object.is(value, -0);

function Amount({ value, balance = false }: { value: number; balance?: boolean }) {
  const precision = useReportPrecision();
  const zero = isZero(value);
  return (
    <td
      className={classes.numeric}
      data-negative={value < 0 && !zero ? '' : undefined}
      data-zero={zero && !balance ? '' : undefined}
    >
      {zero && !balance
        ? '–'
        : value < 0 && !zero
          ? `(${formatAmount(Math.abs(value), precision)})`
          : formatAmount(zero ? 0 : value, precision)}
    </td>
  );
}

export function GeneralLedgerTable({
  accounts,
  period,
  companyName,
  search,
  onSearchChange,
  hideWithoutTransactions,
  onHideWithoutTransactionsChange,
  debitTotal,
  creditTotal,
  printMode = false,
}: Props) {
  const { t, currentLanguage } = useTranslation('reports');
  const navigate = useNavigate();
  const hasSearch = search.trim() !== '';
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [pages, setPages] = useState<Record<string, number>>({});
  const allCollapsed =
    accounts.length > 0 && accounts.every(({ account }) => collapsed.has(account.id));
  const groups = useMemo(() => {
    const byCategory = new Map<string, VisibleLedgerAccount[]>();
    accounts.forEach((item) => {
      const group = byCategory.get(item.account.category) ?? [];
      group.push(item);
      byCategory.set(item.account.category, group);
    });
    return [...byCategory.entries()];
  }, [accounts]);
  const toggleAccount = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setCollapsed(allCollapsed ? new Set() : new Set(accounts.map(({ account }) => account.id)));
  const startLabel = displayLedgerDate(period.startDate, currentLanguage);
  const endLabel = displayLedgerDate(period.endDate, currentLanguage);
  const periodLabel = `${startLabel} ${t('generalLedger.until')} ${endLabel}`;
  const journalPath = (id: string) => routes.journalEntries.detail.replace(':idTransaction', id);
  const accountPath = (item: VisibleLedgerAccount) => {
    const isCashBank = /kas|bank/i.test(item.account.category);
    const path = isCashBank ? routes.accountLedger.cashBank : routes.accountLedger.nonCashBank;
    return `${path.replace(':idAccount', item.account.id)}?from=${period.startDate}&to=${period.endDate}`;
  };
  const rowClick = (event: MouseEvent<HTMLTableRowElement>, id: string) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    navigate(journalPath(id));
  };
  const rowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, id: string) => {
    if (event.key === 'Enter' && event.target === event.currentTarget) navigate(journalPath(id));
  };

  return (
    <Paper withBorder radius="lg" p={0} bg="white" className={classes.ledgerPaper}>
      <Group
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="md"
        p="md"
        className={classes.controls}
      >
        <ReportSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={t('generalLedger.searchAccounts')}
        />
        <Group gap="md" wrap="wrap">
          <Switch
            size="sm"
            color="primary"
            checked={hideWithoutTransactions}
            onChange={(event) => onHideWithoutTransactionsChange(event.currentTarget.checked)}
            label={t('generalLedger.hideWithoutTransactions')}
            aria-label={t('generalLedger.hideWithoutTransactions')}
          />
          <Button variant="default" size="sm" radius="md" onClick={toggleAll}>
            {allCollapsed ? t('generalLedger.expandAll') : t('generalLedger.collapseAll')}
          </Button>
        </Group>
      </Group>
      <div className={classes.reportHeading}>
        {companyName && <Text fz="sm">{companyName}</Text>}
        <Text fw={700} fz="lg">
          {t('generalLedger.pageTitle')}
        </Text>
        <Text fz="sm" c="dimmed">
          {periodLabel}
        </Text>
      </div>
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
              <th>{t('common.date')}</th>
              <th>{t('generalLedger.colReference')}</th>
              <th>{t('generalLedger.colDescription')}</th>
              <th>{t('common.debit')}</th>
              <th>{t('common.creditId')}</th>
              <th>{t('generalLedger.colRunningBalance')}</th>
            </tr>
          </thead>
          {accounts.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title={
                      hasSearch ? t('generalLedger.accountNotFound') : t('generalLedger.emptyTitle')
                    }
                    description={
                      hasSearch
                        ? t('generalLedger.noAccountMatch', { query: search })
                        : t('generalLedger.emptyDescription')
                    }
                    actionLabel={hasSearch ? t('common.resetSearch') : undefined}
                    onAction={hasSearch ? () => onSearchChange('') : undefined}
                    py={40}
                  />
                </td>
              </tr>
            </tbody>
          )}
          {groups.map(([category, items]) => (
            <tbody key={category}>
              <tr className={classes.classRow}>
                <td colSpan={6}>{category}</td>
              </tr>
              {items.map((item) => {
                const { account } = item;
                const isCollapsed = !printMode && collapsed.has(account.id);
                const pageCount = Math.max(1, Math.ceil(item.transactions.length / ROWS_PER_PAGE));
                const page = Math.min(pages[account.id] ?? 1, pageCount);
                const first = (page - 1) * ROWS_PER_PAGE;
                const visible = printMode
                  ? item.transactions
                  : item.transactions.slice(first, first + ROWS_PER_PAGE);
                return (
                  <Fragment key={account.id}>
                    <tr key={`${account.id}-head`} className={classes.accountRow}>
                      <td colSpan={6}>
                        <Group gap="xs" wrap="wrap">
                          <button
                            type="button"
                            className={classes.caret}
                            onClick={() => toggleAccount(account.id)}
                            aria-label={
                              isCollapsed
                                ? t('generalLedger.expandAccount', { name: account.name })
                                : t('generalLedger.collapseAccount', { name: account.name })
                            }
                            aria-expanded={!isCollapsed}
                          >
                            {isCollapsed ? (
                              <IconChevronRight size={16} />
                            ) : (
                              <IconChevronDown size={16} />
                            )}
                          </button>
                          <span className={classes.accountNumber}>{account.number}</span>
                          <Link className={classes.ref} to={accountPath(item)}>
                            {account.name}
                          </Link>
                          <span className={classes.normalBalance}>
                            {t('generalLedger.normalBalance', {
                              side:
                                account.normalBalance === 'credit'
                                  ? t('common.creditId').toLowerCase()
                                  : t('common.debit').toLowerCase(),
                            })}
                          </span>
                        </Group>
                      </td>
                    </tr>
                    {!isCollapsed && (
                      <tr key={`${account.id}-opening`} className={classes.openingRow}>
                        <td colSpan={5}>
                          {t('generalLedger.openingOn', {
                            date: displayLedgerDate(
                              previousLedgerDate(period.startDate),
                              currentLanguage
                            ),
                          })}
                        </td>
                        <Amount value={account.openingBalance} balance />
                      </tr>
                    )}
                    {!isCollapsed &&
                      visible.map((row, index) => (
                        <tr
                          key={`${account.id}-${row.journalId}-${first + index}`}
                          className={row.journalId ? classes.journalRow : undefined}
                          tabIndex={row.journalId ? 0 : undefined}
                          onClick={
                            row.journalId ? (event) => rowClick(event, row.journalId) : undefined
                          }
                          onKeyDown={
                            row.journalId ? (event) => rowKeyDown(event, row.journalId) : undefined
                          }
                        >
                          <td>{displayLedgerDate(row.transactionDate, currentLanguage)}</td>
                          <td>
                            {row.journalId ? (
                              <Tooltip label={t('generalLedger.viewJournalDetail')}>
                                <Link className={classes.ref} to={journalPath(row.journalId)}>
                                  {row.transactionNumber.startsWith('#')
                                    ? row.transactionNumber
                                    : `#${row.transactionNumber}`}
                                </Link>
                              </Tooltip>
                            ) : (
                              row.transactionNumber
                            )}
                          </td>
                          <td>
                            <div className={classes.description}>
                              {row.description || '–'}
                              {row.referenceNumber &&
                              !row.description
                                .toLowerCase()
                                .includes(row.referenceNumber.toLowerCase())
                                ? ` ${row.referenceNumber}`
                                : ''}
                            </div>
                            {row.notes && row.notes !== row.description && (
                              <div className={classes.notes}>{row.notes}</div>
                            )}
                          </td>
                          <Amount value={row.debit} />
                          <Amount value={row.credit} />
                          <Amount value={row.balance} balance />
                        </tr>
                      ))}
                    {!isCollapsed && item.transactions.length === 0 && (
                      <tr key={`${account.id}-empty`} className={classes.emptyTransaction}>
                        <td colSpan={6}>{t('generalLedger.noTransactions')}</td>
                      </tr>
                    )}
                    {!isCollapsed && !printMode && pageCount > 1 && (
                      <tr key={`${account.id}-pager`} className={classes.pagerRow}>
                        <td colSpan={6}>
                          <Group justify="space-between" wrap="wrap">
                            <Text fz="xs" c="dimmed">
                              {t('generalLedger.pagerSummary', {
                                from: formatCount(first + 1),
                                to: formatCount(
                                  Math.min(first + ROWS_PER_PAGE, item.transactions.length)
                                ),
                                total: formatCount(item.transactions.length),
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
                            />
                          </Group>
                        </td>
                      </tr>
                    )}
                    <tr key={`${account.id}-closing`} className={classes.closingRow}>
                      <td colSpan={3}>
                        {t('generalLedger.closingFor', { name: account.name })}
                        {item.filteredRows && (
                          <span className={classes.closingNote}>
                            {' '}
                            {t('generalLedger.allAccountJournals')}
                          </span>
                        )}
                      </td>
                      <Amount value={account.periodDebit} />
                      <Amount value={account.periodCredit} />
                      <Amount value={account.closingBalance} balance />
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          ))}
          {!hasSearch && accounts.length > 0 && (
            <tfoot>
              <tr className={classes.totalRow}>
                <td colSpan={3}>{t('generalLedger.periodTotal')}</td>
                <Amount value={debitTotal} />
                <Amount value={creditTotal} />
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <Text fz="xs" c="dimmed" p="md" className={classes.footnote}>
        {t('generalLedger.footnote', { date: startLabel })}
      </Text>
    </Paper>
  );
}
