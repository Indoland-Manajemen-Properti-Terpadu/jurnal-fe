import React from 'react';
import { Box, Paper, Stack, Text } from '@mantine/core';
import { EmptyState } from '@/components/EmptyState';
import { formatCount, formatMoney } from '@/module/reports/domain/reportFormat';
import {
  TRIAL_BALANCE_GROUPS,
  type TrialBalanceAccount,
  type TrialBalanceCells,
  type TrialBalanceGroup,
  type TrialBalanceReport,
} from '@/module/reports/domain/trialBalance.types';
import { useTranslation } from '@/i18n';
import classes from './TrialBalance.module.css';

const GROUP_KEY: Record<TrialBalanceGroup, string> = {
  opening: 'groupOpening',
  movement: 'groupMovement',
  closing: 'groupClosing',
  profitLoss: 'groupProfitLoss',
  balanceSheet: 'groupBalanceSheet',
};

interface TrialBalanceTableProps {
  report: TrialBalanceReport;
  /** The accounts to show (after the search). */
  accounts: TrialBalanceAccount[];
  search: string;
  onResetSearch: () => void;
}

/** A figure; an empty side (`null`) is left blank, a real 0 is shown. */
const Figure: React.FC<{ value: number | null; first?: boolean }> = ({ value, first }) => (
  <td
    data-first={first ? '' : undefined}
    className={(value ?? 0) < 0 ? classes.negative : undefined}
  >
    {value === null ? '' : formatMoney(value)}
  </td>
);

const EMPTY_CELLS: TrialBalanceCells = { debit: null, credit: null };

/** The trial balance as one table: five column groups of debit and credit, then Total and Selisih. */
export const TrialBalanceTable: React.FC<TrialBalanceTableProps> = ({
  report,
  accounts,
  search,
  onResetSearch,
}) => {
  const { t } = useTranslation('reports');
  const columnCount = 1 + TRIAL_BALANCE_GROUPS.length * 2;

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="md">
        <Box>
          <Text fw={600} fz="md" c="dark.9">
            {t('trialBalance.tableTitle')}
          </Text>
          <Text fz="xs" c="dimmed">
            {t('trialBalance.tableHint')}
          </Text>
        </Box>

        <div className={classes.frame}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th scope="col" rowSpan={2} className={classes.account}>
                  {t('trialBalance.colAccount')}
                </th>
                {TRIAL_BALANCE_GROUPS.map((group) => (
                  <th key={group} scope="colgroup" colSpan={2} data-group="">
                    {t(`trialBalance.${GROUP_KEY[group]}`)}
                  </th>
                ))}
              </tr>
              <tr>
                {TRIAL_BALANCE_GROUPS.map((group) => (
                  <React.Fragment key={group}>
                    <th scope="col" data-first="">
                      {t('trialBalance.colDebit')}
                    </th>
                    <th scope="col">{t('trialBalance.colCredit')}</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} style={{ textAlign: 'center' }}>
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
                accounts.map((account) => (
                  <tr key={account.id || account.accountNumber} data-head={account.isHead}>
                    <td className={classes.account} title={account.name}>
                      <span className={classes.number}>{account.accountNumber}</span>
                      {account.name}
                      {account.isContra && (
                        <span className={classes.contra}>{t('trialBalance.contraAccount')}</span>
                      )}
                    </td>
                    {TRIAL_BALANCE_GROUPS.map((group) => {
                      const cells = account[group] ?? EMPTY_CELLS;
                      return (
                        <React.Fragment key={group}>
                          <Figure value={cells.debit} first />
                          <Figure value={cells.credit} />
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))
              )}

              <tr data-total="total">
                <td className={classes.account}>{t('trialBalance.rowTotal')}</td>
                {TRIAL_BALANCE_GROUPS.map((group) => (
                  <React.Fragment key={group}>
                    <Figure value={report.totals[group].debit} first />
                    <Figure value={report.totals[group].credit} />
                  </React.Fragment>
                ))}
              </tr>
              <tr data-total="balancing">
                <td className={classes.account}>{t('trialBalance.rowBalancing')}</td>
                {TRIAL_BALANCE_GROUPS.map((group) => {
                  const sums =
                    group === 'profitLoss' || group === 'balanceSheet'
                      ? report.balancing[group]
                      : null;
                  return (
                    <React.Fragment key={group}>
                      <Figure value={sums ? sums.debit : null} first />
                      <Figure value={sums ? sums.credit : null} />
                    </React.Fragment>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <Text fz="xs" c="dimmed" className={classes.footer}>
          {t('trialBalance.pagerSummary', { count: formatCount(accounts.length) })}
        </Text>
      </Stack>
    </Paper>
  );
};
