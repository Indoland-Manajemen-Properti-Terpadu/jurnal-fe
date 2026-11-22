import { Table, Text } from '@mantine/core';
import { IconArrowsLeftRight } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import type { StockCard } from '@/module/inventory/domain/stockCard';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import {
  DocumentNumber,
  useMovementTypeLabel,
} from '@/module/inventory/presentation/components/shared/documentCells';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';

type Props = {
  card: StockCard;
  /** False when the service sends no values to this person. */
  showValue: boolean;
  today: string;
};

/** The running balance of one product: an opening row, every movement, then a closing row. */
export function StockCardTable({ card, showValue, today }: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const typeLabel = useMovementTypeLabel();
  const showWarehouse = card.warehouse === null;
  const openingDate = card.from ?? card.rows[0]?.date;
  const closingDate = card.to ?? today;
  // Everything before the "Saldo qty" column: date, document, type, warehouse, in, out.
  const labelSpan = 5 + (showWarehouse ? 1 : 0);
  const columnCount = labelSpan + 1 + (showValue ? 4 : 0);

  const balanceRow = (
    label: string,
    balance: { quantity: number; value: number | null },
    key: string
  ) => (
    <Table.Tr key={key} bg="gray.0">
      <Table.Td colSpan={labelSpan}>
        <Text size="sm" fw={700}>
          {label}
        </Text>
      </Table.Td>
      <Table.Td ta="right">
        <Text size="sm" fw={700}>
          {numberFormat(balance.quantity)}
        </Text>
      </Table.Td>
      {showValue && (
        <>
          <Table.Td colSpan={2} />
          <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
            <Text size="sm" fw={700}>
              {balance.value === null ? '-' : formatCurrency(balance.value)}
            </Text>
          </Table.Td>
          <Table.Td />
        </>
      )}
    </Table.Tr>
  );

  return (
    <DataTableFrame minWidth={showValue ? 1080 : 720}>
      <Table.Thead bg="gray.0">
        <Table.Tr>
          {columnHeader(t('card.date'))}
          {columnHeader(t('card.document'))}
          {columnHeader(t('card.type'))}
          {showWarehouse && columnHeader(t('card.warehouse'))}
          {columnHeader(t('card.in'), 'right')}
          {columnHeader(t('card.out'), 'right')}
          {columnHeader(t('card.balanceQty'), 'right')}
          {showValue && columnHeader(t('card.unitCost'), 'right')}
          {showValue && columnHeader(t('card.movementValue'), 'right')}
          {showValue && columnHeader(t('card.balanceValue'), 'right')}
          {showValue && columnHeader(t('card.avgCost'), 'right')}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {balanceRow(
          openingDate
            ? t('card.openingRow', { date: dateFormatV1(openingDate, 'D MMM YYYY') })
            : t('card.opening'),
          card.opening,
          'opening'
        )}
        {card.rows.length === 0 && (
          <Table.Tr>
            <Table.Td colSpan={columnCount} p={0}>
              <EmptyState
                title={t('card.emptyTitle')}
                description={t('card.emptyBody')}
                icon={<IconArrowsLeftRight size={36} stroke={1.5} />}
                py={36}
              />
            </Table.Td>
          </Table.Tr>
        )}
        {card.rows.map((row) => (
          <Table.Tr key={row.id}>
            <Table.Td style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm">{dateFormatV1(row.date, 'D MMM YYYY')}</Text>
            </Table.Td>
            <Table.Td style={{ whiteSpace: 'nowrap' }}>
              <DocumentNumber
                sourceType={row.sourceType}
                sourceId={row.sourceId}
                number={row.documentNumber}
              />
            </Table.Td>
            <Table.Td>
              <Text size="sm">{typeLabel(row.type, row.typeLabel)}</Text>
            </Table.Td>
            {showWarehouse && (
              <Table.Td>
                <Text size="sm">{row.warehouse.name}</Text>
              </Table.Td>
            )}
            <Table.Td ta="right">
              <Text size="sm" c={row.quantityIn > 0 ? 'green.8' : 'dimmed'}>
                {numberFormat(row.quantityIn)}
              </Text>
            </Table.Td>
            <Table.Td ta="right">
              <Text size="sm" c={row.quantityOut > 0 ? 'red.7' : 'dimmed'}>
                {numberFormat(row.quantityOut)}
              </Text>
            </Table.Td>
            <Table.Td ta="right">
              <Text size="sm" fw={600}>
                {numberFormat(row.balanceQty)}
              </Text>
            </Table.Td>
            {showValue && (
              <>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm">
                    {row.unitCost === null ? '-' : formatCurrency(row.unitCost)}
                  </Text>
                </Table.Td>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm">{row.value === null ? '-' : formatCurrency(row.value)}</Text>
                </Table.Td>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm">
                    {row.balanceValue === null ? '-' : formatCurrency(row.balanceValue)}
                  </Text>
                </Table.Td>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm">{row.avgCost === null ? '-' : formatCurrency(row.avgCost)}</Text>
                </Table.Td>
              </>
            )}
          </Table.Tr>
        ))}
        {balanceRow(
          t('card.closingRow', { date: dateFormatV1(closingDate, 'D MMM YYYY') }),
          card.closing,
          'closing'
        )}
      </Table.Tbody>
    </DataTableFrame>
  );
}
