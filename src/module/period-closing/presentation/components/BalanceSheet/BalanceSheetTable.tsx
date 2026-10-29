import React from 'react';
import { Box, Group, Stack, Table, Text } from '@mantine/core';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { gradientColors, themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import { groupByCategory, sumAmounts } from '@/module/period-closing/domain/reportTotals';
import {
  PROTOTYPE_BALANCE_SHEET_TOTAL,
  PROTOTYPE_REPORT_DATE,
} from '@/module/period-closing/domain/prototypeData';

const BalanceSheetTable: React.FC = () => {
  const { t } = useTranslation('periodClosing');
  const { accounts, isError } = useJournalAccounts();

  if (isError) {
    return <Text c="red">{t('common.loadError')}</Text>;
  }

  const groupedAccounts = accounts && groupByCategory(accounts, t('common.uncategorized'));

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
      <Table withTableBorder highlightOnHover>
        <Table.Tbody>
          {groupedAccounts &&
            Object.entries(groupedAccounts).map(([categoryName, items]) => (
              <React.Fragment key={categoryName}>
                <Table.Tr>
                  <Table.Td colSpan={2} style={{ backgroundColor: themeColors.gray[1] }}>
                    <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                      {categoryName}
                    </Text>
                  </Table.Td>
                </Table.Tr>

                {items.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td fz="sm" style={{ width: '70%' }}>
                      {item.name} ({item.accountNumber})
                    </Table.Td>
                    <Table.Td fz="sm" style={{ textAlign: 'right' }}>
                      {formatCurrency(item.amount || 0)}
                    </Table.Td>
                  </Table.Tr>
                ))}

                <Table.Tr>
                  <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                    {t('common.totalCategory', { category: categoryName })}
                  </Table.Td>
                  <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(sumAmounts(items))}
                  </Table.Td>
                </Table.Tr>
              </React.Fragment>
            ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

export default BalanceSheetTable;
