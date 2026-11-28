import React, { useMemo } from 'react';
import { Box, Paper, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import type { ProfitLossStatement } from '@/module/reports/domain/profitLoss.types';
import {
  buildProfitLossStatementRows,
  type ProfitLossStatementRow,
} from '@/module/reports/domain/profitLossStatementRows';
import { formatAmount, formatCount } from '@/module/reports/domain/reportFormat';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import {
  useReportNegativeFormat,
  useReportPrecision,
} from '@/module/reports/presentation/hooks/useReportPrecision';
import classes from './ProfitLossStatementTable.module.css';

interface ProfitLossStatementTableProps {
  statement: ProfitLossStatement;
  compare: ProfitLossStatement | null;
  mode: 'rinci' | 'ringkas';
  hideZero: boolean;
  search: string;
  onResetSearch: () => void;
  companyName?: string;
  language: string;
}

const sectionTranslation: Record<string, string> = {
  pendapatan: 'tableRevenueSection',
  hpp: 'tableDirectCostSection',
  beban: 'tableOperatingExpenseSection',
  lainMasuk: 'tableOtherIncomeSection',
  lainKeluar: 'tableOtherExpenseSection',
  pajak: 'tableIncomeTaxSection',
};

const totalTranslation: Record<string, string> = {
  pendapatan: 'tableRevenueTotal',
  hpp: 'tableDirectCostTotal',
  beban: 'tableOperatingExpenseTotal',
  lainMasuk: 'tableOtherIncomeTotal',
  lainKeluar: 'tableOtherExpenseTotal',
  pajak: 'tableIncomeTaxTotal',
};

const resultTranslation: Record<string, string> = {
  grossProfit: 'tableGrossProfit',
  operatingProfit: 'tableOperatingProfit',
  profitBeforeTax: 'tableProfitBeforeTax',
  netProfit: 'tableNetProfit',
};

const displayLongDate = (value: string, language: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const displayPeriodLabel = (
  fromValue: string,
  toValue: string,
  language: string,
  until: string
) => {
  const from = new Date(`${fromValue}T00:00:00`);
  const to = new Date(`${toValue}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return '';
  const locale = language === 'id' ? 'id-ID' : 'en-US';
  const sameMonth = from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth();
  const month = from.toLocaleDateString(locale, { month: 'short' });
  if (sameMonth) {
    const isFullMonth =
      from.getDate() === 1 &&
      to.getDate() === new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate();
    return isFullMonth
      ? `${month} ${to.getFullYear()}`
      : `${from.getDate()}–${to.getDate()} ${month} ${to.getFullYear()}`;
  }
  return `${displayLongDate(fromValue, language)} ${until} ${displayLongDate(toValue, language)}`;
};

const displayAmount = (
  value: number | null,
  precision: number,
  negativeFormat: ReturnType<typeof useReportNegativeFormat>
) => {
  if (value === null || value === 0) return '–';
  return formatAmount(value, precision, negativeFormat);
};

export const ProfitLossStatementTable: React.FC<ProfitLossStatementTableProps> = ({
  statement,
  compare,
  mode,
  hideZero,
  search,
  onResetSearch,
  companyName,
  language,
}) => {
  const { t } = useTranslation('reports');
  const precision = useReportPrecision();
  const negativeFormat = useReportNegativeFormat();
  const hasCompare = compare !== null;
  const colSpan = hasCompare ? 4 : 3;
  const { rows, accountCount } = useMemo(
    () => buildProfitLossStatementRows(statement, compare, { mode, hideZero, search }),
    [statement, compare, mode, hideZero, search]
  );

  const labelFor = (row: ProfitLossStatementRow) => {
    if (row.kind === 'section') {
      return sectionTranslation[row.key]
        ? t(`profitLoss.${sectionTranslation[row.key]}`)
        : row.label;
    }
    if (row.kind === 'total') {
      return totalTranslation[row.key] ? t(`profitLoss.${totalTranslation[row.key]}`) : row.label;
    }
    if (row.kind === 'result' || row.kind === 'grand') {
      return resultTranslation[row.key] ? t(`profitLoss.${resultTranslation[row.key]}`) : row.label;
    }
    return row.label;
  };

  const periodText = `${displayLongDate(statement.from, language)} ${t('profitLoss.periodUntil')} ${displayLongDate(statement.to, language)}`;
  const sources = Object.entries(statement.modules)
    .map(([name, count]) => `${name} ${formatCount(count)}`)
    .join(' · ');

  return (
    <Paper withBorder radius="lg" p={0} className={classes.frame}>
      <Box className={classes.reportHeading}>
        {companyName && (
          <Text fz="sm" c="dimmed">
            {companyName}
          </Text>
        )}
        <Text fz="lg" fw={700} c="dark.9">
          {t('catalog.incomeStatementTitle')}
        </Text>
        <Text fz="sm" c="dimmed" mt={2}>
          {periodText}
        </Text>
      </Box>

      <ScrollArea offsetScrollbars>
        <Table className={classes.table} verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">{t('profitLoss.colCode')}</Table.Th>
              <Table.Th scope="col">{t('profitLoss.colAccount')}</Table.Th>
              <Table.Th scope="col" ta="right">
                {displayPeriodLabel(
                  statement.from,
                  statement.to,
                  language,
                  t('profitLoss.periodUntil')
                ) || statement.label}
              </Table.Th>
              {compare && (
                <Table.Th scope="col" ta="right">
                  {displayPeriodLabel(
                    compare.from,
                    compare.to,
                    language,
                    t('profitLoss.periodUntil')
                  ) || compare.label}
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {mode === 'rinci' && accountCount === 0 && (
              <Table.Tr>
                <Table.Td colSpan={colSpan}>
                  <EmptyState
                    title={search ? t('profitLoss.noMatchTitle') : t('profitLoss.emptyTitle')}
                    description={
                      search
                        ? t('profitLoss.noMatchDescription', { query: search })
                        : t('profitLoss.emptyDescription')
                    }
                    actionLabel={search ? t('common.resetSearch') : undefined}
                    onAction={search ? onResetSearch : undefined}
                    py={40}
                  />
                </Table.Td>
              </Table.Tr>
            )}
            {rows.map((row, index) => {
              if (row.kind === 'section') {
                return (
                  <Table.Tr key={`${row.kind}-${row.key}-${index}`} data-kind={row.kind}>
                    <Table.Td colSpan={2}>{labelFor(row)}</Table.Td>
                    <Table.Td />
                    {hasCompare && <Table.Td />}
                  </Table.Tr>
                );
              }

              if (row.kind === 'account') {
                const accountPath = row.accountId
                  ? routes.accountLedger.nonCashBank.replace(':idAccount', row.accountId)
                  : undefined;
                return (
                  <Table.Tr
                    key={`${row.kind}-${row.key}-${row.code}-${index}`}
                    data-kind={row.kind}
                  >
                    <Table.Td className={classes.code}>{row.code}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        {accountPath ? (
                          <Text
                            component={Link}
                            to={accountPath}
                            size="sm"
                            fw={600}
                            c="primary.7"
                            className={classes.accountLink}
                          >
                            {row.label}
                          </Text>
                        ) : (
                          <Text size="sm" fw={600} c="primary.7">
                            {row.label}
                          </Text>
                        )}
                        {row.category && (
                          <Text fz="xs" c="dimmed">
                            {row.category}
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td
                      ta="right"
                      className={
                        row.amount !== null && row.amount < 0 ? classes.negative : undefined
                      }
                    >
                      {displayAmount(row.amount, precision, negativeFormat)}
                    </Table.Td>
                    {hasCompare && (
                      <Table.Td
                        ta="right"
                        className={
                          row.compareAmount !== null && row.compareAmount < 0
                            ? classes.negative
                            : undefined
                        }
                      >
                        {displayAmount(row.compareAmount, precision, negativeFormat)}
                      </Table.Td>
                    )}
                  </Table.Tr>
                );
              }

              return (
                <Table.Tr key={`${row.kind}-${row.key}-${index}`} data-kind={row.kind}>
                  <Table.Td colSpan={2}>{labelFor(row)}</Table.Td>
                  <Table.Td
                    ta="right"
                    className={row.amount !== null && row.amount < 0 ? classes.negative : undefined}
                  >
                    {displayAmount(row.amount, precision, negativeFormat)}
                  </Table.Td>
                  {hasCompare && (
                    <Table.Td
                      ta="right"
                      className={
                        row.compareAmount !== null && row.compareAmount < 0
                          ? classes.negative
                          : undefined
                      }
                    >
                      {displayAmount(row.compareAmount, precision, negativeFormat)}
                    </Table.Td>
                  )}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Stack gap={4} className={classes.note}>
        <Text fz="xs" c="dimmed">
          {t('profitLoss.journalFootnote', {
            count: formatCount(statement.journalCount),
            from: displayLongDate(statement.from, language),
            to: displayLongDate(statement.to, language),
            sources: sources || t('profitLoss.noJournalSources'),
          })}
        </Text>
        <Text fz="xs" c="dimmed">
          {t('profitLoss.amountFootnote')}
        </Text>
        {statement.totals.pajak === 0 && (
          <Text fz="xs" c="dimmed">
            {t('profitLoss.noIncomeTaxFootnote')}
          </Text>
        )}
      </Stack>
    </Paper>
  );
};
