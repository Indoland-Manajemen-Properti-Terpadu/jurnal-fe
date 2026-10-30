import React from 'react';
import { Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import { gradientColors, themeColors } from '@/theme';

type RowProps = {
  total: number;
};

const border = {
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
};
const rowStyle = border;
const sectionInsideCategory = { backgroundColor: themeColors.gray[0], ...border };

const HeaderTable: React.FC<{ title: string }> = ({ title }) => (
  <Table.Tr>
    <Table.Td colSpan={2} style={sectionInsideCategory}>
      <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
        {title}
      </Text>
    </Table.Td>
  </Table.Tr>
);

const SubSection: React.FC<{ title: string }> = ({ title }) => (
  <Table.Tr style={sectionInsideCategory}>
    <Table.Td fz="sm" style={{ fontWeight: 600 }} colSpan={2}>
      {title}
    </Table.Td>
  </Table.Tr>
);

const TableRow: React.FC<{ label: string; value: number; fontWeight?: number }> = ({
  label,
  value,
  fontWeight = 400,
}) => (
  <Table.Tr style={rowStyle}>
    <Table.Td fz="sm" style={{ fontWeight }}>
      {label}
    </Table.Td>
    <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight }}>
      {formatCurrency(value)}
    </Table.Td>
  </Table.Tr>
);

export const CashFlowfromOA: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return (
    <>
      <HeaderTable title={t('cashFlow.operatingHeader')} />
      <SubSection title={t('cashFlow.cashInflows')} />
      <TableRow label={t('cashFlow.cashFromCustomers')} value={total} />
      <TableRow label={t('cashFlow.otherIncome')} value={total} />
      <SubSection title={t('cashFlow.cashOutflows')} />
      <TableRow label={t('cashFlow.paymentToSuppliers')} value={total} />
      <TableRow label={t('cashFlow.operationalExpenditures')} value={total} />
      <TableRow label={t('cashFlow.shortTermLiabilities')} value={total} />
      <TableRow label={t('cashFlow.netOperating')} value={total} fontWeight={600} />
    </>
  );
};

export const CashFlowfromIA: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return (
    <>
      <HeaderTable title={t('cashFlow.investingHeader')} />
      <TableRow label={t('cashFlow.acquisitionOfAssets')} value={total} />
      <TableRow label={t('cashFlow.saleOfAssets')} value={total} />
      <TableRow label={t('cashFlow.otherInvesting')} value={total} />
      <TableRow label={t('cashFlow.netInvesting')} value={total} fontWeight={600} />
    </>
  );
};

export const CashFlowfromFA: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return (
    <>
      <HeaderTable title={t('cashFlow.financingHeader')} />
      <TableRow label={t('cashFlow.paymentsOfLoans')} value={total} />
      <TableRow label={t('cashFlow.receiptsOfLoans')} value={total} />
      <TableRow label={t('cashFlow.equityCapital')} value={total} />
      <TableRow label={t('cashFlow.dividendsPaid')} value={total} />
      <TableRow label={t('cashFlow.netFinancing')} value={total} fontWeight={600} />
    </>
  );
};

export const EndingCashPosition: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('periodClosing');
  return (
    <>
      <HeaderTable title={t('cashFlow.endingHeader')} />
      <TableRow label={t('cashFlow.netIncrease')} value={total} />
      <TableRow label={t('cashFlow.cashAtBeginning')} value={total} />
      <TableRow label={t('cashFlow.cashAtEnd')} value={total} fontWeight={600} />
    </>
  );
};
