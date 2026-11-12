import React from 'react';
import { Box, Paper, ScrollArea, Stack, Text } from '@mantine/core';
import { EmptyState } from '@/components/EmptyState';
import type { ProfitLossRow } from '@/module/reports/domain/profitLoss.types';
import type { ProfitLossLine, ProfitLossRole } from '@/module/reports/domain/profitLossRows';
import { formatMoney } from '@/module/reports/domain/reportFormat';
import { useTranslation } from '@/i18n';
import { useReportPrecision } from '@/module/reports/presentation/hooks/useReportPrecision';
import classes from './ProfitLoss.module.css';

const ROLE_KEY: Record<ProfitLossRole, string> = {
  'total.revenue': 'totalRevenue',
  'total.directCost': 'totalDirectCost',
  'total.opex': 'totalOpex',
  'total.otherIncome': 'totalOtherIncome',
  'total.otherExpense': 'totalOtherExpense',
  'total.tax': 'totalTax',
  'profit.gross': 'profitGross',
  'profit.afterOpex': 'profitAfterOpex',
  'profit.nett': 'profitNett',
  'profit.afterTax': 'profitAfterTax',
  'title.tax': 'titleTax',
};

interface ProfitLossTableProps {
  lines: ProfitLossLine[];
  /** Accounts shown, to tell an empty statement from a statement with figures. */
  accountCount: number;
  search: string;
  onResetSearch: () => void;
}

/** The statement as one table: group heads, accounts, subtotals, totals and the profit lines. */
export const ProfitLossTable: React.FC<ProfitLossTableProps> = ({
  lines,
  accountCount,
  search,
  onResetSearch,
}) => {
  const precision = useReportPrecision();
  const { t } = useTranslation('reports');

  const labelOf = (line: ProfitLossRow & { role?: ProfitLossRole; groupLabel?: string }) => {
    if (line.role) return t(`profitLoss.${ROLE_KEY[line.role]}`);
    if (line.type !== 'subtotal') return line.label;
    return line.groupLabel
      ? t('profitLoss.subtotalOf', { group: line.groupLabel })
      : t('profitLoss.subtotal');
  };

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="md">
        <Box>
          <Text fw={600} fz="md" c="dark.9">
            {t('profitLoss.tableTitle')}
          </Text>
          <Text fz="xs" c="dimmed">
            {t('profitLoss.tableHint')}
          </Text>
        </Box>

        <ScrollArea offsetScrollbars>
          <div className={classes.frame}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th scope="col">{t('profitLoss.colAccount')}</th>
                  <th scope="col">{t('profitLoss.colAmount')}</th>
                </tr>
              </thead>
              <tbody>
                {accountCount === 0 ? (
                  <tr>
                    <td colSpan={2}>
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
                    </td>
                  </tr>
                ) : (
                  lines.map((line, index) => {
                    const negative = (line.amount ?? 0) < 0;
                    const hasAmount = line.amount !== null;
                    return (
                      <tr
                        key={`${line.type}-${line.accountNumber}-${index}`}
                        data-type={line.type}
                        data-standalone={line.standalone ? 'true' : undefined}
                      >
                        <td colSpan={hasAmount ? 1 : 2}>
                          {line.accountNumber && (
                            <span className={classes.number}>{line.accountNumber}</span>
                          )}
                          {labelOf(line)}
                          {line.isContra && (
                            <span className={classes.contra}>{t('profitLoss.contraAccount')}</span>
                          )}
                        </td>
                        {hasAmount && (
                          <td className={negative ? classes.negative : undefined}>
                            {formatMoney(line.amount ?? 0, precision)}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </Stack>
    </Paper>
  );
};
