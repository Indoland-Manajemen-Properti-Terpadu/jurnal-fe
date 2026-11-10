import React from 'react';
import { Box, Group, Paper, Stack, Text } from '@mantine/core';
import { EmptyState } from '@/components/EmptyState';
import { formatAmount, formatCount } from '@/module/reports/domain/reportFormat';
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

interface FigureProps {
  value: number | null;
  side: 'debit' | 'credit';
  /** The first column of its group: a firm line is drawn before it. */
  start?: boolean;
  band?: boolean;
}

/** A figure; an empty side (`null`) is left blank, a real 0 is shown but muted. */
const Figure: React.FC<FigureProps> = ({ value, side, start, band }) => (
  <td
    data-side={side}
    data-start={start ? '' : undefined}
    data-band={band ? '' : undefined}
    className={value === 0 ? classes.zero : (value ?? 0) < 0 ? classes.negative : undefined}
  >
    {value === null ? '' : formatAmount(value)}
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

  const groupProps = (index: number) => ({ band: index % 2 === 1 });

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="md">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="xs">
          <Box>
            <Text fw={600} fz="md" c="dark.9">
              {t('trialBalance.tableTitle')}
            </Text>
            <Text fz="xs" c="dimmed">
              {t('trialBalance.tableHint')}
            </Text>
          </Box>
          <Text fz="xs" c="dimmed" fw={600} className={classes.unit}>
            {t('trialBalance.unitNote')}
          </Text>
        </Group>

        <div className={classes.frame}>
          <table className={classes.table}>
            <colgroup>
              <col className={classes.colAccount} />
              {TRIAL_BALANCE_GROUPS.flatMap((group) => [
                <col key={`${group}-debit`} className={classes.colFigure} />,
                <col key={`${group}-credit`} className={classes.colFigure} />,
              ])}
            </colgroup>
            <thead>
              <tr>
                <th scope="col" rowSpan={2} className={classes.account}>
                  {t('trialBalance.colAccount')}
                </th>
                {TRIAL_BALANCE_GROUPS.map((group, index) => (
                  <th
                    key={group}
                    scope="colgroup"
                    colSpan={2}
                    data-start=""
                    data-band={groupProps(index).band ? '' : undefined}
                  >
                    {t(`trialBalance.${GROUP_KEY[group]}`)}
                  </th>
                ))}
              </tr>
              <tr>
                {TRIAL_BALANCE_GROUPS.map((group, index) => (
                  <React.Fragment key={group}>
                    <th
                      scope="col"
                      data-side="debit"
                      data-start=""
                      data-band={groupProps(index).band ? '' : undefined}
                    >
                      {t('trialBalance.colDebit')}
                    </th>
                    <th
                      scope="col"
                      data-side="credit"
                      data-band={groupProps(index).band ? '' : undefined}
                    >
                      {t('trialBalance.colCredit')}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr className={classes.empty}>
                  <td colSpan={columnCount}>
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
                    <td className={classes.account}>
                      <span className={classes.accountRow}>
                        <span className={classes.number}>{account.accountNumber}</span>
                        <span className={classes.name}>{account.name}</span>
                        {account.isContra && (
                          <span className={classes.contra}>{t('trialBalance.contraAccount')}</span>
                        )}
                      </span>
                    </td>
                    {TRIAL_BALANCE_GROUPS.map((group, index) => {
                      const cells = account[group] ?? EMPTY_CELLS;
                      return (
                        <React.Fragment key={group}>
                          <Figure value={cells.debit} side="debit" start {...groupProps(index)} />
                          <Figure value={cells.credit} side="credit" {...groupProps(index)} />
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr data-total="total">
                <td className={classes.account}>{t('trialBalance.rowTotal')}</td>
                {TRIAL_BALANCE_GROUPS.map((group, index) => (
                  <React.Fragment key={group}>
                    <Figure
                      value={report.totals[group].debit}
                      side="debit"
                      start
                      {...groupProps(index)}
                    />
                    <Figure
                      value={report.totals[group].credit}
                      side="credit"
                      {...groupProps(index)}
                    />
                  </React.Fragment>
                ))}
              </tr>
              <tr data-total="balancing">
                <td className={classes.account}>{t('trialBalance.rowBalancing')}</td>
                {TRIAL_BALANCE_GROUPS.map((group, index) => {
                  const sums =
                    group === 'profitLoss' || group === 'balanceSheet'
                      ? report.balancing[group]
                      : null;
                  return (
                    <React.Fragment key={group}>
                      <Figure
                        value={sums ? sums.debit : null}
                        side="debit"
                        start
                        {...groupProps(index)}
                      />
                      <Figure
                        value={sums ? sums.credit : null}
                        side="credit"
                        {...groupProps(index)}
                      />
                    </React.Fragment>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        <Text fz="xs" c="dimmed">
          {t('trialBalance.pagerSummary', { count: formatCount(accounts.length) })}
        </Text>
      </Stack>
    </Paper>
  );
};
