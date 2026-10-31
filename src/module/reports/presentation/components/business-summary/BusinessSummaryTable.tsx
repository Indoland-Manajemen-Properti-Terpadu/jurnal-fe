import React from 'react';
import { Stack, Table, Text } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import { formatCurrency } from '@/utils/FormatCurrency';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import {
  CashFlowfromOA,
  CashFlowfromIA,
  CashFlowfromFA,
  EndingCashPosition,
} from '@/module/reports/presentation/components/cash-flow/CashFlowTableRow';
import {
  BalanceSheetSummary,
  CashFlowSummary,
  IncomeStatementSummary,
  InsightReport,
} from '@/module/reports/presentation/components/business-summary/BusinessSummaryTableRow';

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

const BusinessSummaryTable: React.FC = () => {
  const { accounts, isError } = useJournalAccounts();
  return (
    <Stack>
      <Table withTableBorder style={rowStyle}>
        <Table.Tbody>
          <IncomeStatementSummary total={3000} />
          <BalanceSheetSummary total={3000} />
          <CashFlowSummary total={3000} />
          <InsightReport total={3000} />
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

export default BusinessSummaryTable;
