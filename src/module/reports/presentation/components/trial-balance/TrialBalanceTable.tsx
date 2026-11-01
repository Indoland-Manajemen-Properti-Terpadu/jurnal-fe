import React from 'react';
import { Stack, Table, Text } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTrialBalanceReport } from '@/module/reports/presentation/hooks/useTrialBalanceReport';
import { NotFound } from '@/components/ErrorPage/NotFound';
import { Account, Reports } from '@/module/reports/domain/TrialBalanceReport.types';
import { useTranslation } from '@/i18n';

interface TrialBalanceTableProps {
  fromDate: string;
  toDate: string;
}

const TrialBalanceTable: React.FC<TrialBalanceTableProps> = ({ fromDate, toDate }) => {
  const { t } = useTranslation('reports');
  const { data: report, isError } = useTrialBalanceReport(fromDate, toDate);

  if (isError) {
    return <NotFound />;
  }

  if (!report?.data.length) {
    return <Text>{t('common.noDataForRange')}</Text>;
  }

  return (
    <Stack>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr
            style={{
              backgroundColor: themeColors.primary[0],
            }}
          >
            <Table.Th
              colSpan={2}
              rowSpan={2}
              ta="center"
              style={{ border: `1px solid ${themeColors.gray[2]}` }}
            >
              {t('common.accountNameEn')}
            </Table.Th>
            <Table.Th
              colSpan={2}
              rowSpan={1}
              ta="center"
              style={{ border: `1px solid ${themeColors.gray[2]}` }}
            >
              {t('common.beginningBalanceEn')}
            </Table.Th>
            <Table.Th
              colSpan={2}
              rowSpan={1}
              ta="center"
              style={{ border: `1px solid ${themeColors.gray[2]}` }}
            >
              {t('common.changes')}
            </Table.Th>
            <Table.Th
              colSpan={2}
              rowSpan={1}
              ta="center"
              style={{ border: `1px solid ${themeColors.gray[2]}` }}
            >
              {t('common.closingBalance')}
            </Table.Th>
          </Table.Tr>
          <Table.Tr
            style={{
              backgroundColor: themeColors.primary[0],
            }}
          >
            <Table.Th ta="center" style={{ border: `1px solid ${themeColors.gray[2]}` }}>
              {t('common.debit')}
            </Table.Th>
            <Table.Th ta="center" style={{ border: `1px solid ${themeColors.gray[2]}` }}>
              {t('common.credit')}
            </Table.Th>
            <Table.Th ta="center" style={{ border: `1px solid ${themeColors.gray[2]}` }}>
              {t('common.debit')}
            </Table.Th>
            <Table.Th ta="center" style={{ border: `1px solid ${themeColors.gray[2]}` }}>
              {t('common.credit')}
            </Table.Th>
            <Table.Th ta="center" style={{ border: `1px solid ${themeColors.gray[2]}` }}>
              {t('common.debit')}
            </Table.Th>
            <Table.Th ta="center" style={{ border: `1px solid ${themeColors.gray[2]}` }}>
              {t('common.credit')}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {/* Category Name */}

          {report.data?.map((item: Reports) => (
            <React.Fragment key={item.category}>
              {/* Category Header Section*/}
              <Table.Tr>
                <Table.Td colSpan={12} style={{ backgroundColor: themeColors.gray[1] }}>
                  <Text fz="sm" w={600} variant="gradient" gradient={gradientColors.mainGR}>
                    {item.category}
                  </Text>
                </Table.Td>
              </Table.Tr>

              {/* AcountName Items within the category */}
              {item.account?.map((accounts: Account) => (
                <Table.Tr key={accounts.id}>
                  <Table.Td
                    colSpan={2}
                    fz="sm"
                    style={{ border: `1px solid ${themeColors.gray[2]}` }}
                  >
                    {accounts.name} ({accounts.accountNumber})
                  </Table.Td>
                  {/* Beginning Balance */}
                  <Table.Td
                    fz="sm"
                    ta="center"
                    style={{ border: `1px solid ${themeColors.gray[2]}` }}
                  >
                    {formatCurrency(accounts.beginningBalance.debit!)}
                  </Table.Td>
                  <Table.Td
                    fz="sm"
                    ta="center"
                    style={{ border: `1px solid ${themeColors.gray[2]}` }}
                  >
                    {formatCurrency(accounts.beginningBalance.credit!)}
                  </Table.Td>

                  {/* Changes */}
                  <Table.Td
                    fz="sm"
                    ta="center"
                    style={{ border: `1px solid ${themeColors.gray[2]}` }}
                  >
                    {formatCurrency(accounts.changes.debit!)}
                  </Table.Td>
                  <Table.Td
                    fz="sm"
                    ta="center"
                    style={{ border: `1px solid ${themeColors.gray[2]}` }}
                  >
                    {formatCurrency(accounts.changes.credit!)}
                  </Table.Td>

                  {/* Ending Balance */}
                  <Table.Td
                    fz="sm"
                    ta="center"
                    style={{ border: `1px solid ${themeColors.gray[2]}` }}
                  >
                    {formatCurrency(accounts.endingBalance.debit!)}
                  </Table.Td>
                  <Table.Td
                    fz="sm"
                    ta="center"
                    style={{ border: `1px solid ${themeColors.gray[2]}` }}
                  >
                    {formatCurrency(accounts.endingBalance.credit!)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </React.Fragment>
          ))}
        </Table.Tbody>
        {/* End of Table Column Total // SKIP FOR NOW */}
        <Table.Tr>
          <Table.Td
            fz="sm"
            colSpan={2}
            style={{
              fontWeight: 600,
              border: `1px solid ${themeColors.gray[2]}`,
              backgroundColor: themeColors.gray[1],
            }}
          >
            {t('common.total')}
          </Table.Td>
          <Table.Td
            fz="sm"
            style={{
              textAlign: 'center',
              fontWeight: 600,
              border: `1px solid ${themeColors.gray[2]}`,
              backgroundColor: themeColors.gray[1],
            }}
          >
            {report.total.totalDebitBeginningBalance >= 0
              ? formatCurrency(report.total.totalDebitBeginningBalance)
              : `(${formatCurrency(Math.abs(report.total.totalDebitBeginningBalance))})`}
          </Table.Td>
          <Table.Td
            fz="sm"
            style={{
              textAlign: 'center',
              fontWeight: 600,
              border: `1px solid ${themeColors.gray[2]}`,
              backgroundColor: themeColors.gray[1],
            }}
          >
            {report.total.totalCreditBeginningBalance >= 0
              ? formatCurrency(report.total.totalCreditBeginningBalance)
              : `(${formatCurrency(Math.abs(report.total.totalCreditBeginningBalance))})`}
          </Table.Td>
          <Table.Td
            fz="sm"
            style={{
              textAlign: 'center',
              fontWeight: 600,
              border: `1px solid ${themeColors.gray[2]}`,
              backgroundColor: themeColors.gray[1],
            }}
          >
            {report.total.totalDebitChanges >= 0
              ? formatCurrency(report.total.totalDebitChanges)
              : `(${formatCurrency(Math.abs(report.total.totalDebitChanges))})`}
          </Table.Td>
          <Table.Td
            fz="sm"
            style={{
              textAlign: 'center',
              fontWeight: 600,
              border: `1px solid ${themeColors.gray[2]}`,
              backgroundColor: themeColors.gray[1],
            }}
          >
            {report.total.totalCreditChanges >= 0
              ? formatCurrency(report.total.totalCreditChanges)
              : `(${formatCurrency(Math.abs(report.total.totalCreditChanges))})`}
          </Table.Td>
          <Table.Td
            fz="sm"
            style={{
              textAlign: 'center',
              fontWeight: 600,
              border: `1px solid ${themeColors.gray[2]}`,
              backgroundColor: themeColors.gray[1],
            }}
          >
            {report.total.totalDebitBeginningBalance >= 0
              ? formatCurrency(report.total.totalDebitBeginningBalance)
              : `(${formatCurrency(Math.abs(report.total.totalDebitBeginningBalance))})`}
          </Table.Td>
          <Table.Td
            fz="sm"
            style={{
              textAlign: 'center',
              fontWeight: 600,
              border: `1px solid ${themeColors.gray[2]}`,
              backgroundColor: themeColors.gray[1],
            }}
          >
            {report.total.totalCreditEndingBalance >= 0
              ? formatCurrency(report.total.totalCreditEndingBalance)
              : `(${formatCurrency(Math.abs(report.total.totalCreditEndingBalance))})`}
          </Table.Td>
        </Table.Tr>
      </Table>
    </Stack>
  );
};

export default TrialBalanceTable;
