import React from 'react';
import { Stack, Table } from '@mantine/core';
import { themeColors } from '@/theme';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import {
  CashFlowfromFA,
  CashFlowfromIA,
  CashFlowfromOA,
  EndingCashPosition,
} from '@/module/reports/presentation/components/cash-flow/CashFlowTableRow';

const rowStyle = {
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
};

const CashFlowTable: React.FC = () => {
  useJournalAccounts();
  return (
    <Stack>
      <Table withTableBorder style={rowStyle}>
        <Table.Tbody>
          <CashFlowfromOA total={3000} />
          <CashFlowfromIA total={3000} />
          <CashFlowfromFA total={3000} />
          <EndingCashPosition total={3000} />
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

export default CashFlowTable;
