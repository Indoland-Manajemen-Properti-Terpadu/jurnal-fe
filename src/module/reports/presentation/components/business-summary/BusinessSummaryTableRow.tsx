import React from 'react';
import { Table, Text } from '@mantine/core';
import { formatCurrency } from '@/utils/formatCurrency';
import { gradientColors, themeColors } from '@/theme';

import { useTranslation } from '@/i18n';

type RowProps = {
  total: number;
};
const rowStyle = {
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
};

const headTableStyle = {
  backgroundColor: themeColors.gray[0],
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
};

type HeaderTableProps = {
  title: string;
};

interface TableRowProps {
  label: string;
  type?: 'percentage' | 'price' | 'days';
  total: number;
}
const HeaderTable: React.FC<HeaderTableProps> = ({ title }) => (
  <Table.Tr>
    <Table.Td colSpan={2} style={headTableStyle}>
      <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
        {title}
      </Text>
    </Table.Td>
  </Table.Tr>
);

const TableRow: React.FC<TableRowProps> = ({ label, type, total }) => {
  let displayTotal;

  switch (type) {
    case 'percentage':
      displayTotal = `${total}%`;
      break;
    case 'days':
      displayTotal = `${total} Days`;
      break;
    default:
      displayTotal = formatCurrency(total);
  }

  return (
    <Table.Tr style={rowStyle}>
      <Table.Td fz="sm" style={{ fontWeight: 400 }}>
        {label}
      </Table.Td>
      <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
        {displayTotal}
      </Table.Td>
    </Table.Tr>
  );
};

export const IncomeStatementSummary: React.FC<RowProps> = () => {
  const { t } = useTranslation('reports');
  return (
    <>
      <HeaderTable title={t('summaryRow.incomeStatement')} />
      <TableRow label={t('summaryRow.revenue')} total={200} />
      <TableRow label={t('summaryRow.cogs')} total={200} />
      <TableRow label={t('summaryRow.opex')} total={200} />
      <TableRow label={t('summaryRow.operatingIncome')} total={200} />
      <TableRow label={t('summaryRow.netProfit')} total={200} />
    </>
  );
};
export const BalanceSheetSummary: React.FC<RowProps> = () => {
  const { t } = useTranslation('reports');
  return (
    <>
      <HeaderTable title={t('summaryRow.balanceSheet')} />
      <TableRow label={t('summaryRow.revenue')} total={200} />
      <TableRow label={t('summaryRow.cogs')} total={200} />
      <TableRow label={t('summaryRow.opex')} total={200} />
      <TableRow label={t('summaryRow.operatingIncome')} total={200} />
      <TableRow label={t('summaryRow.netProfit')} total={200} />
    </>
  );
};

export const CashFlowSummary: React.FC<RowProps> = () => {
  const { t } = useTranslation('reports');
  return (
    <>
      <HeaderTable title={t('summaryRow.cashFlow')} />
      <TableRow label={t('summaryRow.revenue')} total={200} />
      <TableRow label={t('summaryRow.cogs')} total={200} />
      <TableRow label={t('summaryRow.opex')} total={200} />
      <TableRow label={t('summaryRow.operatingIncome')} total={200} />
      <TableRow label={t('summaryRow.netProfit')} total={200} />
    </>
  );
};

export const InsightReport: React.FC<RowProps> = () => {
  const { t } = useTranslation('reports');
  return (
    <>
      <HeaderTable title={t('summaryRow.insight')} />
      <TableRow label={t('summaryRow.revenue')} total={200} type="percentage" />
      <TableRow label={t('summaryRow.cogs')} total={200} type="percentage" />
      <TableRow label={t('summaryRow.opex')} total={200} type="percentage" />
      <TableRow label={t('summaryRow.operatingIncome')} total={200} type="days" />
      <TableRow label={t('summaryRow.netProfit')} total={200} type="days" />
    </>
  );
};
