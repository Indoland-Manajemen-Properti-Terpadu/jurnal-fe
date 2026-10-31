import React from 'react';
import { Table, Text } from '@mantine/core';
import { formatCurrency } from '@/utils/FormatCurrency';
import { gradientColors, themeColors } from '@/theme';

import { useTranslation } from '@/i18n';
type RowProps = {
  total: number;
};
const rowStyle = {
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
};

const sectionInsideCategory = {
  backgroundColor: themeColors.gray[0],
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

type HeaderTableProps = {
  title: string;
};

interface TableRowProps {
  label: string;
  value: number;
  fontWeight?: number;
}
const HeaderTable: React.FC<HeaderTableProps> = ({ title }) => {
  return (
    <Table.Tr>
      <Table.Td colSpan={2} style={headTableStyle}>
        <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
          {title}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
};

const TableRow: React.FC<TableRowProps> = ({ label, value, fontWeight = 400 }) => (
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
  const { t } = useTranslation('reports');
  return (
    <>
      <HeaderTable title={t('cashFlowRow.operating')} />
      <Table.Tr style={sectionInsideCategory}>
        <Table.Td fz="sm" style={{ fontWeight: 600 }} colSpan={2}>
          {t('cashFlowRow.inflows')}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.fromCustomer')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.otherIncome')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={sectionInsideCategory}>
        <Table.Td fz="sm" style={{ fontWeight: 600 }} colSpan={2}>
          {t('cashFlowRow.outflows')}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.toSuppliers')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.opex')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.creditCard')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 600 }}>
          {t('cashFlowRow.netOperating')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 600 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
    </>
  );
};

export const CashFlowfromIA: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('reports');
  return (
    <>
      <HeaderTable title={t('cashFlowRow.investing')} />
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.acquisition')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.sale')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.otherInvesting')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 600 }}>
          {t('cashFlowRow.netInvesting')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 600 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
    </>
  );
};

export const CashFlowfromFA: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('reports');
  return (
    <>
      <HeaderTable title={t('cashFlowRow.financing')} />
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.loanPayments')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.loanReceipts')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.equityCapital')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.dividends')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 600 }}>
          {t('cashFlowRow.netFinancing')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 600 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
    </>
  );
};

export const EndingCashPosition: React.FC<RowProps> = ({ total }) => {
  const { t } = useTranslation('reports');
  return (
    <>
      <HeaderTable title={t('cashFlowRow.financing')} />
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.netChange')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 400 }}>
          {t('cashFlowRow.beginningCash')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 400 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
      <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 600 }}>
          {t('cashFlowRow.endingCash')}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: 'right', fontWeight: 600 }}>
          {formatCurrency(total)}
        </Table.Td>
      </Table.Tr>
    </>
  );
};
