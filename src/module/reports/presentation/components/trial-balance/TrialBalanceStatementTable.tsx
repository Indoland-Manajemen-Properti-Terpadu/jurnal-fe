import React, { useMemo } from 'react';
import { Box, Paper, Stack, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import type {
  TrialBalanceStatement,
  TrialBalanceStatementGroup,
  TrialBalanceStatementRow,
} from '@/module/reports/domain/trialBalance.types';
import { formatAmount, formatCount } from '@/module/reports/domain/reportFormat';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import {
  useReportNegativeFormat,
  useReportPrecision,
} from '@/module/reports/presentation/hooks/useReportPrecision';
import classes from './TrialBalanceStatementTable.module.css';

interface TrialBalanceStatementTableProps {
  statement: TrialBalanceStatement;
  mode: 'rinci' | 'ringkas';
  search: string;
  onResetSearch: () => void;
  companyName?: string;
}

type AmountField =
  | 'open_debit'
  | 'open_credit'
  | 'debit'
  | 'credit'
  | 'close_debit'
  | 'close_credit';
type AmountValues = Record<AmountField, number>;

const AMOUNT_FIELDS: AmountField[] = [
  'open_debit',
  'open_credit',
  'debit',
  'credit',
  'close_debit',
  'close_credit',
];

const Amounts: React.FC<{ row: AmountValues }> = ({ row }) => {
  const precision = useReportPrecision();
  const negativeFormat = useReportNegativeFormat();
  return (
    <>
      {AMOUNT_FIELDS.map((field, index) => {
        const value = row[field];
        return (
          <td
            key={field}
            data-start={index % 2 === 0 ? '' : undefined}
            className={value < 0 ? classes.negative : value === 0 ? classes.zero : undefined}
          >
            {value === 0 ? '–' : formatAmount(value, precision, negativeFormat)}
          </td>
        );
      })}
    </>
  );
};

const matches = (row: TrialBalanceStatementRow, query: string) => {
  const term = query.trim().toLocaleLowerCase();
  return (
    !term ||
    row.code.toLocaleLowerCase().includes(term) ||
    row.name.toLocaleLowerCase().includes(term)
  );
};

const visibleGroups = (
  groups: TrialBalanceStatementGroup[],
  search: string,
  mode: 'rinci' | 'ringkas'
) =>
  groups
    .map((group) => ({
      ...group,
      rows:
        mode === 'ringkas' && search.trim()
          ? group.rows
          : group.rows.filter((row) => matches(row, search)),
    }))
    .filter(
      (group) =>
        !search.trim() ||
        group.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) ||
        group.rows.some((row) => matches(row, search))
    );

export const TrialBalanceStatementTable: React.FC<TrialBalanceStatementTableProps> = ({
  statement,
  mode,
  search,
  onResetSearch,
  companyName,
}) => {
  const { t } = useTranslation('reports');
  const groups = useMemo(
    () => visibleGroups(statement.groups, search, mode),
    [statement.groups, search, mode]
  );
  const dateRange = `${longDate(statement.from)} ${t('trialBalance.periodUntil')} ${longDate(statement.to)}`;

  return (
    <Paper withBorder radius="lg" p={0} className={classes.frame}>
      <Box className={classes.heading}>
        {companyName && (
          <Text fz="sm" c="dimmed">
            {companyName}
          </Text>
        )}
        <Text fz="lg" fw={700} c="dark.9">
          {t('catalog.trialBalanceTitle')}
        </Text>
        <Text fz="sm" c="dimmed" mt={2}>
          {dateRange}
        </Text>
      </Box>

      <div className={classes.scroller}>
        <table className={classes.table}>
          <colgroup>
            <col className={classes.codeCol} />
            <col className={classes.accountCol} />
            {AMOUNT_FIELDS.map((field) => (
              <col key={field} className={classes.amountCol} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={2} scope="col">
                {t('trialBalance.colCode')}
              </th>
              <th rowSpan={2} scope="col">
                {t('trialBalance.colAccountName')}
              </th>
              <th colSpan={2} scope="colgroup" data-start="">
                {t('trialBalance.groupOpening')}
              </th>
              <th colSpan={2} scope="colgroup" data-start="">
                {t('trialBalance.groupMovement')}
              </th>
              <th colSpan={2} scope="colgroup" data-start="">
                {t('trialBalance.groupClosing')}
              </th>
            </tr>
            <tr>
              {Array.from({ length: 3 }, (_, index) => (
                <React.Fragment key={index}>
                  <th scope="col" data-start="">
                    {t('trialBalance.colDebit')}
                  </th>
                  <th scope="col">{t('trialBalance.colCredit')}</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={8} className={classes.empty}>
                  <EmptyState
                    title={search ? t('trialBalance.noMatchTitle') : t('trialBalance.emptyTitle')}
                    description={
                      search
                        ? t('trialBalance.noMatchDescription', { query: search })
                        : t('trialBalance.emptyDescription')
                    }
                    actionLabel={search ? t('common.resetSearch') : undefined}
                    onAction={search ? onResetSearch : undefined}
                    py={40}
                  />
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <React.Fragment key={group.key}>
                  {mode === 'rinci' ? (
                    <>
                      <tr className={classes.category}>
                        <td colSpan={8}>{group.label}</td>
                      </tr>
                      {group.rows.map((row) => {
                        const accountPath = row.id
                          ? routes.accountLedger.nonCashBank.replace(':idAccount', row.id)
                          : undefined;
                        return (
                          <tr key={row.id || row.code}>
                            <td className={classes.code}>{row.code}</td>
                            <td>
                              <Stack gap={2}>
                                {accountPath ? (
                                  <Link to={accountPath} className={classes.accountLink}>
                                    {row.name}
                                  </Link>
                                ) : (
                                  <span className={classes.accountLink}>{row.name}</span>
                                )}
                                <span className={classes.accountMeta}>
                                  {row.lines > 0
                                    ? t('trialBalance.journalLineCount', {
                                        count: formatCount(row.lines),
                                      })
                                    : null}
                                </span>
                              </Stack>
                            </td>
                            <Amounts row={row} />
                          </tr>
                        );
                      })}
                      <tr className={classes.subtotal}>
                        <td colSpan={2}>
                          {t('trialBalance.categoryTotal', {
                            category: group.label.toLocaleLowerCase(),
                          })}
                        </td>
                        <Amounts row={group} />
                      </tr>
                    </>
                  ) : (
                    <tr className={classes.subtotal}>
                      <td colSpan={2}>
                        {group.label}
                        <span className={classes.accountMeta}>
                          {t('trialBalance.accountCountNote', {
                            count: formatCount(group.rows.length),
                          })}
                        </span>
                      </td>
                      <Amounts row={group} />
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>{t('trialBalance.rowGrandTotal')}</td>
              <Amounts row={statement.totals} />
            </tr>
          </tfoot>
        </table>
      </div>

      <Box className={classes.footnote}>
        <Text fz="xs" c="dimmed">
          {t('trialBalance.statementFootnote', {
            start: longDate(statement.from),
          })}
        </Text>
      </Box>
    </Paper>
  );
};

const longDate = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};
