import React from 'react';
import { Stack, Table, Text } from '@mantine/core';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { gradientColors, themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import { groupByCategory } from '../../domain/reportTotals';

const cellBorder = { border: `1px solid ${themeColors.gray[2]}` };
const totalStyle = {
  textAlign: 'center' as const,
  fontWeight: 600,
  ...cellBorder,
  backgroundColor: themeColors.gray[1],
};

const TrialBalanceTable: React.FC = () => {
  const { t } = useTranslation('periodClosing');
  const { accounts, isError } = useJournalAccounts();

  if (isError) {
    return <Text c="red">{t('common.loadError')}</Text>;
  }

  const groupedAccounts = accounts && groupByCategory(accounts, t('common.uncategorized'));
  const amountCells = (debit: number, credit: number) =>
    [0, 1, 2].map((section) => (
      <React.Fragment key={section}>
        <Table.Td fz="sm" ta="center" style={cellBorder}>
          {formatCurrency(debit)}
        </Table.Td>
        <Table.Td fz="sm" ta="center" style={cellBorder}>
          {formatCurrency(credit)}
        </Table.Td>
      </React.Fragment>
    ));
  const groupHeaders = [
    t('trialBalance.beginningBalance'),
    t('trialBalance.changes'),
    t('trialBalance.closingBalance'),
  ];

  return (
    <Stack>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: themeColors.primary[0] }}>
            <Table.Th colSpan={2} rowSpan={2} ta="center" style={cellBorder}>
              {t('common.accountName')}
            </Table.Th>
            {groupHeaders.map((header) => (
              <Table.Th key={header} colSpan={2} rowSpan={1} ta="center" style={cellBorder}>
                {header}
              </Table.Th>
            ))}
          </Table.Tr>
          <Table.Tr style={{ backgroundColor: themeColors.primary[0] }}>
            {groupHeaders.map((header) => (
              <React.Fragment key={header}>
                <Table.Th ta="center" style={cellBorder}>
                  {t('common.debit')}
                </Table.Th>
                <Table.Th ta="center" style={cellBorder}>
                  {t('common.credit')}
                </Table.Th>
              </React.Fragment>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {groupedAccounts &&
            Object.entries(groupedAccounts).map(([categoryName, items]) => (
              <React.Fragment key={categoryName}>
                <Table.Tr>
                  <Table.Td colSpan={12} style={{ backgroundColor: themeColors.gray[1] }}>
                    <Text fz="sm" w={600} variant="gradient" gradient={gradientColors.mainGR}>
                      {categoryName}
                    </Text>
                  </Table.Td>
                </Table.Tr>
                {items.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td colSpan={2} fz="sm" style={cellBorder}>
                      {item.name} ({item.accountNumber})
                    </Table.Td>
                    {amountCells(item.debit!, item.credit!)}
                  </Table.Tr>
                ))}
              </React.Fragment>
            ))}
        </Table.Tbody>
        <Table.Tr>
          <Table.Td fz="sm" colSpan={2} style={{ ...totalStyle, textAlign: 'left' }}>
            {t('common.total')}
          </Table.Td>
          {[0, 1, 2, 3, 4, 5].map((column) => (
            <Table.Td key={column} fz="sm" style={totalStyle}>
              {formatCurrency(0)}
            </Table.Td>
          ))}
        </Table.Tr>
      </Table>
    </Stack>
  );
};

export default TrialBalanceTable;
