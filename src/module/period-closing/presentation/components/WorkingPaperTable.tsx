import React from 'react';
import { Stack, Table, Text } from '@mantine/core';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { gradientColors, themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import { groupByCategory } from '../../domain/reportTotals';

const cellBorder = { border: `1px solid ${themeColors.gray[2]}` };
const headerStyle = { ...cellBorder, fontSize: '14', fontWeight: '500' };
const totalStyle = {
  textAlign: 'right' as const,
  fontWeight: 600,
  ...cellBorder,
  backgroundColor: themeColors.gray[1],
};

const WorkingPaperTable: React.FC = () => {
  const { t } = useTranslation('periodClosing');
  const { accounts, isError } = useJournalAccounts();

  if (isError) {
    return <Text c="red">{t('common.loadError')}</Text>;
  }

  const groupedAccounts = accounts && groupByCategory(accounts, t('common.uncategorized'));
  const amountCells = (debit: number, credit: number) =>
    [0, 1, 2].map((section) => (
      <React.Fragment key={section}>
        <Table.Td fz="sm" ta="right" style={cellBorder}>
          {formatCurrency(debit)}
        </Table.Td>
        <Table.Td fz="sm" ta="right" style={cellBorder}>
          {formatCurrency(credit)}
        </Table.Td>
      </React.Fragment>
    ));

  return (
    <Stack>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: themeColors.primary[0] }}>
            <Table.Th colSpan={2} rowSpan={2} ta="center" style={headerStyle}>
              {t('workingPaper.code')}
            </Table.Th>
            <Table.Th colSpan={2} rowSpan={2} ta="center" style={headerStyle}>
              {t('common.accountName')}
            </Table.Th>
            <Table.Th colSpan={2} rowSpan={1} ta="center" style={headerStyle}>
              {t('workingPaper.trialBalance')}
            </Table.Th>
            <Table.Th colSpan={2} rowSpan={1} ta="center" style={headerStyle}>
              {t('workingPaper.incomeStatement')}
            </Table.Th>
            <Table.Th colSpan={2} rowSpan={1} ta="center" style={headerStyle}>
              {t('workingPaper.balanceSheet')}
            </Table.Th>
          </Table.Tr>
          <Table.Tr style={{ backgroundColor: themeColors.primary[0] }}>
            {[0, 1, 2].map((section) => (
              <React.Fragment key={section}>
                <Table.Th ta="center" style={headerStyle}>
                  {t('common.debit')}
                </Table.Th>
                <Table.Th ta="center" style={headerStyle}>
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
                      {item.accountNumber}
                    </Table.Td>
                    <Table.Td colSpan={2} fz="sm" style={cellBorder}>
                      {item.name}
                    </Table.Td>
                    {amountCells(item.debit!, item.credit!)}
                  </Table.Tr>
                ))}
              </React.Fragment>
            ))}
        </Table.Tbody>
        <Table.Tr>
          <Table.Td fz="sm" colSpan={4} style={{ ...totalStyle, textAlign: 'left' }}>
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

export default WorkingPaperTable;
