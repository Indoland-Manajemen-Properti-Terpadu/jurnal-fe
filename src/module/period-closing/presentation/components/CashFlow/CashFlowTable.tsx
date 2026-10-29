import React from 'react';
import { Box, Group, Stack, Table, Text } from '@mantine/core';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import { PROTOTYPE_BALANCE_SHEET_TOTAL, PROTOTYPE_CASH_FLOW_TOTAL, PROTOTYPE_REPORT_DATE } from '@/module/period-closing/domain/prototypeData';
import { CashFlowfromFA, CashFlowfromIA, CashFlowfromOA, EndingCashPosition } from './TableRow';

const rowStyle = {
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
};

const CashFlowTable: React.FC = () => {
  const { t } = useTranslation('periodClosing');

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
          <Stack gap={1}>
            <Text c={themeColors.black[9]} fz={14} fw={500}>
              {t('common.report')}
            </Text>
            <Text c={themeColors.gray[6]} fz={14} fw={500}>
              {t('common.period', { date: PROTOTYPE_REPORT_DATE })}
            </Text>
          </Stack>
          <Text c={themeColors.black[9]} fz={14} fw={500}>
            {t('common.totalValue', { amount: formatCurrency(PROTOTYPE_BALANCE_SHEET_TOTAL) })}
          </Text>
        </Group>
      </Box>
      <Table withTableBorder style={rowStyle}>
        <Table.Tbody>
          <CashFlowfromOA total={PROTOTYPE_CASH_FLOW_TOTAL} />
          <CashFlowfromIA total={PROTOTYPE_CASH_FLOW_TOTAL} />
          <CashFlowfromFA total={PROTOTYPE_CASH_FLOW_TOTAL} />
          <EndingCashPosition total={PROTOTYPE_CASH_FLOW_TOTAL} />
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

export default CashFlowTable;
