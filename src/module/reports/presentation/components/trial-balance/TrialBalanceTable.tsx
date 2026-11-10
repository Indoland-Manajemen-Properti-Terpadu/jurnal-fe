import React from 'react';
import { Box, Group, Paper, Stack, Text } from '@mantine/core';
import { EmptyState } from '@/components/EmptyState';
import { formatAmount, formatCount } from '@/module/reports/domain/reportFormat';
import type { TrialBalanceSection } from '@/module/reports/domain/trialBalance';
import {
  TRIAL_BALANCE_GROUPS,
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
  /** The accounts to show (after the search), grouped by account class. */
  sections: TrialBalanceSection[];
  /** How many accounts the sections hold, for the count under the table. */
  accountCount: number;
  search: string;
  onResetSearch: () => void;
}

interface FigureProps {
  value: number | null;
  side: 'debit' | 'credit';
  /** The first column of its group: a firm line is drawn before it. */
  start?: boolean;
}

/** A figure; zero is muted, and `null` (no figure at all) is left blank. */
const Figure: React.FC<FigureProps> = ({ value, side, start }) => (
  <td
    data-side={side}
    data-start={start ? '' : undefined}
    className={value === 0 ? classes.zero : (value ?? 0) < 0 ? classes.negative : undefined}
  >
    {value === null ? '' : formatAmount(value)}
  </td>
);

const EMPTY_CELLS: TrialBalanceCells = { debit: null, credit: null };

/** The trial balance as one table: five column groups of debit and credit, then Total and Selisih. */
export const TrialBalanceTable: React.FC<TrialBalanceTableProps> = ({
  report,
  sections,
  accountCount,
  search,
  onResetSearch,
}) => {
  const { t } = useTranslation('reports');
  const columnCount = 1 + TRIAL_BALANCE_GROUPS.length * 2;

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
                {TRIAL_BALANCE_GROUPS.map((group) => (
                  <th key={group} scope="colgroup" colSpan={2} data-start="">
                    {t(`trialBalance.${GROUP_KEY[group]}`)}
                  </th>
                ))}
              </tr>
              <tr>
                {TRIAL_BALANCE_GROUPS.map((group) => (
                  <React.Fragment key={group}>
                    <th scope="col" data-side="debit" data-start="">
                      {t('trialBalance.colDebit')}
                    </th>
                    <th scope="col" data-side="credit">
                      {t('trialBalance.colCredit')}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.length === 0 ? (
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
                sections.map((section) => (
                  <React.Fragment key={section.key}>
                    <tr className={classes.groupRow}>
                      <td className={classes.account}>{t(`common.accountClass${section.key}`)}</td>
                      <td colSpan={columnCount - 1} />
                    </tr>
                    {section.accounts.map((account) => (
                      <tr key={account.id || account.accountNumber}>
                        <td className={classes.account}>
                          <span className={classes.accountRow}>
                            <span className={classes.number}>{account.accountNumber}</span>
                            <span className={classes.name}>{account.name}</span>
                            {account.isContra && (
                              <span className={classes.contra}>
                                {t('trialBalance.contraAccount')}
                              </span>
                            )}
                          </span>
                        </td>
                        {TRIAL_BALANCE_GROUPS.map((group) => {
                          const cells = account[group] ?? EMPTY_CELLS;
                          return (
                            <React.Fragment key={group}>
                              <Figure value={cells.debit ?? 0} side="debit" start />
                              <Figure value={cells.credit ?? 0} side="credit" />
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
            <tfoot>
              <tr data-total="total">
                <td className={classes.account}>{t('trialBalance.rowTotal')}</td>
                {TRIAL_BALANCE_GROUPS.map((group) => (
                  <React.Fragment key={group}>
                    <Figure value={report.totals[group].debit} side="debit" start />
                    <Figure value={report.totals[group].credit} side="credit" />
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
                      <Figure value={sums ? sums.debit : null} side="debit" start />
                      <Figure value={sums ? sums.credit : null} side="credit" />
                    </React.Fragment>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        <Text fz="xs" c="dimmed">
          {t('trialBalance.pagerSummary', { count: formatCount(accountCount) })}
        </Text>
      </Stack>
    </Paper>
  );
};
