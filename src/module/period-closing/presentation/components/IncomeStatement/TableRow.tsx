import React from 'react';
import { Table } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { themeColors } from '@/theme';

type RowProps = {
  total: number;
};

const rowStyle = {
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
};

interface LineProps {
  label: string;
  value: string;
  fontWeight?: number;
}

const Line: React.FC<LineProps> = ({ label, value, fontWeight = 600 }) => (
  <Table.Tr style={rowStyle}>
    <Table.Td fz="sm" style={{ fontWeight }}>
      {label}
    </Table.Td>
    <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight }}>
      {value}
    </Table.Td>
  </Table.Tr>
);

export const SalesRevenueRow: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return <Line label={t('incomeStatement.totalOperatingRevenue')} value={formatCurrency(total)} />;
};

export const CostofRevenueRow: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return (
    <>
      <Line label={t('incomeStatement.totalCostOfRevenue')} value={formatCurrency(total)} />
      <Line label={t('incomeStatement.grossProfit')} value={formatCurrency(total)} />
    </>
  );
};

export const OperatingExpensesRow: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return (
    <>
      <Line label={t('incomeStatement.totalOperatingExpenses')} value={formatCurrency(total)} />
      <Line label={t('incomeStatement.operatingProfit')} value={formatCurrency(total)} />
    </>
  );
};

export const NonOperatingExpensesRow: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return (
    <Line label={t('incomeStatement.totalNonOperatingExpenses')} value={formatCurrency(total)} />
  );
};

export const NonOperatingIncomeRow: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return (
    <>
      <Line label={t('incomeStatement.totalNonOperatingIncome')} value={formatCurrency(total)} />
      <Line label={t('incomeStatement.totalNonOperatingNet')} value={formatCurrency(total)} />
    </>
  );
};

export const ProfitandTaxRow: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return (
    <>
      <Line label={t('incomeStatement.profitBeforeTax')} value={formatCurrency(total)} />
      <Line label={t('incomeStatement.incomeTax')} value={formatCurrency(total)} fontWeight={400} />
      <Line label={t('incomeStatement.netIncome')} value={formatCurrency(total)} />
      <Line
        label={t('incomeStatement.earningsPerShare')}
        value={t('incomeStatement.perShare', { amount: formatCurrency(total) })}
        fontWeight={400}
      />
    </>
  );
};

type IncomeStatementTableRowProps = {
  categoryName: string;
  categoryTotal: number;
};

const IncomeStatementTableRow: React.FC<IncomeStatementTableRowProps> = ({
  categoryName,
  categoryTotal,
}) => {
  switch (categoryName.toLowerCase()) {
    case 'sales revenue':
      return <SalesRevenueRow total={categoryTotal} />;
    case 'operating expenses':
      return <OperatingExpensesRow total={categoryTotal} />;
    case 'non-operating expenses':
      return <NonOperatingExpensesRow total={categoryTotal} />;
    case 'other revenue':
      return <NonOperatingIncomeRow total={categoryTotal} />;
    default:
      return null;
  }
};

export default IncomeStatementTableRow;
