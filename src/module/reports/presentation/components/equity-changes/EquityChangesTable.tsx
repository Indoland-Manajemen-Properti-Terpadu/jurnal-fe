import React from 'react';
import { Stack, Table, Text } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import { formatMoneyAt } from '@/utils/formatMoney';
import { useDecimalPrecision } from '@/module/settings';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { useEquityChangeReport } from '@/module/reports/presentation/hooks/useEquityChangeReport';
import { ReportUnavailable } from '@/module/reports/presentation/components/shared/ReportUnavailable';
import { dateFormatV2 } from '@/utils/formatDate';

import { useTranslation } from '@/i18n';

const rowStyle = {
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
};

const sectionCategoryStyle = {
  backgroundColor: themeColors.gray[1],
};

interface EquityChangeTableProps {
  fromDate?: string;
  toDate?: string;
}

const EquityChangesTable: React.FC<EquityChangeTableProps> = ({ fromDate, toDate }) => {
  const { t } = useTranslation('reports');
  const {
    data: reports,
    isError,
    isLoading,
    refetch,
  } = useEquityChangeReport({ fromDate: fromDate!, toDate: toDate! });
  const settingsPrecision = useDecimalPrecision();
  const precision = reports?.precision ?? settingsPrecision;

  if (isError) {
    return <ReportUnavailable embedded onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <Text>{t('common.loading')}</Text>;
  }

  if (!reports) {
    return <EmptyState />;
  }
  return (
    <Stack>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr
            style={{
              backgroundColor: themeColors.primary[0],
              borderColor: themeColors.gray[1],
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <Table.Th colSpan={4}>
              <Stack gap={1}>
                <Text c={themeColors.black[9]} fz="var(--jurnal-text-sm)" fw={500}>
                  {t('common.report')}
                </Text>
                <Text c={themeColors.gray[6]} fz="var(--jurnal-text-sm)" fw={500}>
                  {' '}
                  {t('common.period')} {dateFormatV2(fromDate!!)} - {dateFormatV2(toDate!!)}
                </Text>
              </Stack>
            </Table.Th>
            <Table.Th colSpan={2} ta="left">
              {t('common.beginningBalanceEn')}
            </Table.Th>
            <Table.Th colSpan={2} ta="left">
              {t('common.debit')}
            </Table.Th>
            <Table.Th colSpan={2} ta="left">
              {t('common.credit')}
            </Table.Th>
            <Table.Th colSpan={2} ta="left">
              {t('common.endingBalanceEn')}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          <Table.Tr>
            <Table.Td
              colSpan={12}
              style={{
                ...sectionCategoryStyle,
                borderColor: themeColors.gray[1],
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              <Text
                fz="var(--jurnal-text-sm)"
                w={500}
                gradient={gradientColors.mainGR}
                variant="gradient"
              >
                {t('equityChanges.ownerEquity')}
              </Text>
            </Table.Td>
          </Table.Tr>
          {reports.accounts.map((account) => (
            <Table.Tr key={account.name} style={rowStyle}>
              <Table.Td
                fz="var(--jurnal-text-sm)"
                colSpan={4}
                style={{ textAlign: 'left', fontWeight: account.isBold ? 600 : 400 }}
              >
                {account.name && account.accountNumber
                  ? `${account.name} (${account.accountNumber})`
                  : account.name || account.accountNumber}
              </Table.Td>
              <Table.Td
                fz="var(--jurnal-text-sm)"
                colSpan={2}
                style={{ textAlign: 'left', fontWeight: account.isBold ? 600 : 400 }}
              >
                {formatMoneyAt(account.beginningBalance || 0, precision)}
              </Table.Td>
              <Table.Td
                fz="var(--jurnal-text-sm)"
                colSpan={2}
                style={{ textAlign: 'left', fontWeight: account.isBold ? 600 : 400 }}
              >
                {formatMoneyAt(account.changesDebit || 0, precision)}
              </Table.Td>
              <Table.Td
                fz="var(--jurnal-text-sm)"
                colSpan={2}
                style={{ textAlign: 'left', fontWeight: account.isBold ? 600 : 400 }}
              >
                {formatMoneyAt(account.changesCredit || 0, precision)}
              </Table.Td>
              <Table.Td
                fz="var(--jurnal-text-sm)"
                colSpan={2}
                style={{ textAlign: 'left', fontWeight: account.isBold ? 600 : 400 }}
              >
                {formatMoneyAt(account.endingBalance || 0, precision)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

export default EquityChangesTable;
