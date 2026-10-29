import React from 'react';
import { Box, Group, Stack, Table, Text } from '@mantine/core';
import { useJournalAccounts, type JournalAccounts } from '@/module/chart-of-accounts';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { gradientColors, themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import { sumAmounts } from '../../../domain/reportTotals';
import {
  PROTOTYPE_COST_OF_REVENUE,
  PROTOTYPE_INCOME_TOTAL,
  PROTOTYPE_NON_OPERATING_EXPENSES,
  PROTOTYPE_PROFIT_AND_TAX,
} from '../../../domain/prototypeData';
import IncomeStatementTableRow, {
  CostofRevenueRow,
  NonOperatingExpensesRow,
  ProfitandTaxRow,
} from './TableRow';

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

const filterByCategory = (accounts: JournalAccounts[], category: string) =>
  accounts.filter((account) => account.category?.name?.toLowerCase() === category.toLowerCase());

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Table.Tr>
    <Table.Td colSpan={2} style={headTableStyle}>
      <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
        {title}
      </Text>
    </Table.Td>
  </Table.Tr>
);

const AccountRows: React.FC<{ accounts: JournalAccounts[] }> = ({ accounts }) => (
  <>
    {accounts.map((account) => (
      <Table.Tr key={account.id} style={rowStyle}>
        <Table.Td fz="sm" style={{ width: '70%' }}>
          {account.name} ({account.accountNumber})
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right' }}>
          {formatCurrency(account.amount || 0)}
        </Table.Td>
      </Table.Tr>
    ))}
  </>
);

const IncomeStatementTable: React.FC = () => {
  const { t } = useTranslation('periodClosing');
  const { accounts, isError } = useJournalAccounts();

  if (isError) {
    return <Text c="red">{t('common.loadError')}</Text>;
  }
  if (!accounts || accounts.length === 0) {
    return <EmptyState />;
  }

  const operatingRevenue = filterByCategory(accounts, 'sales revenue');
  const operatingExpenses = filterByCategory(accounts, 'operating expenses');
  const nonOperatingIncome = filterByCategory(accounts, 'other revenue');

  return (
    <Stack gap={0}>
      <Box
        bg={themeColors.primary[0]}
        bd="sm"
        p={10}
        style={{
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          borderColor: themeColors.gray[1],
          borderStyle: 'solid',
          borderWidth: '1px',
          borderBottomWidth: '0px',
        }}
      >
        <Group justify="space-between">
          <Text c={themeColors.black[9]} fz={14} fw={500}>
            {t('common.report')}
          </Text>
          <Text c={themeColors.black[9]} fz={14} fw={500}>
            {t('common.totalValue', { amount: formatCurrency(PROTOTYPE_INCOME_TOTAL) })}
          </Text>
        </Group>
      </Box>
      <Table withTableBorder style={rowStyle}>
        <Table.Tbody>
          <SectionHeader title={t('incomeStatement.operatingRevenue')} />
          <AccountRows accounts={operatingRevenue} />
          <IncomeStatementTableRow
            categoryName="sales revenue"
            categoryTotal={sumAmounts(operatingRevenue)}
          />

          <SectionHeader title={t('incomeStatement.costOfRevenue')} />
          <CostofRevenueRow total={PROTOTYPE_COST_OF_REVENUE} />

          <SectionHeader title={t('incomeStatement.operatingExpense')} />
          <AccountRows accounts={operatingExpenses} />
          <IncomeStatementTableRow
            categoryName="operating expenses"
            categoryTotal={sumAmounts(operatingExpenses)}
          />

          <SectionHeader title={t('incomeStatement.nonOperatingExpenses')} />
          <NonOperatingExpensesRow total={PROTOTYPE_NON_OPERATING_EXPENSES} />

          <SectionHeader title={t('incomeStatement.nonOperatingIncome')} />
          <AccountRows accounts={nonOperatingIncome} />
          <IncomeStatementTableRow
            categoryName="other revenue"
            categoryTotal={sumAmounts(nonOperatingIncome)}
          />

          <SectionHeader title={t('incomeStatement.profitAndTax')} />
          <ProfitandTaxRow total={PROTOTYPE_PROFIT_AND_TAX} />
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

export default IncomeStatementTable;
